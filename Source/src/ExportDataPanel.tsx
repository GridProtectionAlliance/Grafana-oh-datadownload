import React from 'react';
import { PanelProps, dateTimeAsMoment } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import moment from 'moment';  // eslint-disable-line
import { getBackendSrv } from '@grafana/runtime';

interface Props extends PanelProps<SimpleOptions> {}

export const ExportDataPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();
  const [fileLink, setFileLink] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState<number>(0);
  const [endTime, setEndTime] = React.useState<number>(0);
  const [pointIDs, setPointIDs] = React.useState<string[]>([]);

  React.useEffect(() => {
    let framerate = options.Rate;

    if (options.RateBase === 'frames per minute') {
      framerate = framerate / 60.0;
    }

    if (options.RateBase === 'frames per hour') {
      framerate = framerate / (60.0 * 60.0);
    }

    let tolerance = 0.5;
    if (options.Round) {
      tolerance = 500 / framerate;
    }

    const link =
      options.Link +
      'ExportDataHandler.ashx?PointIDs=' +
      pointIDs.join(',') +
      '&StartTime=' +
      moment.utc(startTime).format('MM/DD/YYYY HH:mm:ss.000000') +
      '&EndTime=' +
      moment.utc(endTime).format('MM/DD/YYYY HH:mm:ss.000000') +
      '&FrameRate=' +
      framerate.toString() +
      '&AlignTimestamps=' +
      (options.AlignTS ? 'true' : 'false') +
      '&MissingAsNaNParam=' +
      (options.ExportNaN ? 'true' : 'false') +
      '&FillMissingTimestamps=' +
      (options.MissingTS ? 'true' : 'false') +
      '&InstanceName=' +
      'PPA' +
      '&TSSnap=' +
      formatTSSnap().toString() +
      '&TSTolerance=' +
      tolerance.toString();

    setFileLink(link);
  }, [options, startTime, endTime, pointIDs, formatTSSnap]);

  const formatTSSnap = React.useCallback(() => {
    if (options.FirstTS === 'first available measurement') {
      return 1;
    }
    return 2;
  }, [options.FirstTS]);

  React.useEffect(() => {
    if (data.state !== 'Done') {
      return;
    }

    if (data.timeRange !== undefined && data.timeRange.from !== undefined) {
      setStartTime(dateTimeAsMoment(data.timeRange.from).valueOf());
    }

    if (data.timeRange !== undefined && data.timeRange.to !== undefined) {
      setEndTime(dateTimeAsMoment(data.timeRange.to).valueOf());
    }

    setPointIDs([]);
    // target....
    data.series.forEach(element => {
      const dat = { target: element.name };
      getBackendSrv()
        .post(options.Link + 'api/grafana' + '/GetMetadata', dat)
        .then(d => {
          const jsonMetaData = JSON.parse(d);
          const id = jsonMetaData[0]['ID'].split(':');
          setPointIDs(arr => [...arr, id[1].trim()]);
        });
    });
  }, [data, options.Link]);

  function handleClick() {
    window.location.href = fileLink;
  }

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <div
        className="button"
        style={{
          backgroundColor: options.Color,
          height: 'calc(100% - 5px)',
          width: 'calc(100% - 5px)',
          margin: '5px',
          textAlign: 'center',
          display: 'inline-block',
          fontSize: options.FontSize,
          color: options.TextColor,
          verticalAlign: 'middle',
        }}
        onClick={() => handleClick()}
      >
        Download Data
      </div>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
  };
});
