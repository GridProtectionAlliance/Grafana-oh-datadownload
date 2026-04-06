import React from 'react';
import { PanelProps, dateTimeAsMoment, dateTimeFormatISO, dateTimeFormatTimeAgo } from '@grafana/data';
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
  const [instance, setInstance] = React.useState<string>('PPA');

  const pointIDField = "ID";

  const formatTSSnap = React.useCallback(() => {
    if (options.FirstTS === 'first available measurement') {
      return 1;
    }
    return 2;
  }, [options.FirstTS]);

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

    if (pointIDs.length === 0) {
      throw new Error('Unable to find data to be downloaded');
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
      instance +
      '&TSSnap=' +
      formatTSSnap().toString() +
      '&TSTolerance=' +
      tolerance.toString();

    setFileLink(link);
  }, [options, startTime, endTime, pointIDs, formatTSSnap, instance]);

  React.useEffect(() => {

    if (data.timeRange !== undefined && data.timeRange.from !== undefined) {
      setStartTime(dateTimeAsMoment(data.timeRange.from).valueOf());
    }

    if (data.timeRange !== undefined && data.timeRange.to !== undefined) {
      setEndTime(dateTimeAsMoment(data.timeRange.to).valueOf());
    }

    const pointIDs: string[] = [];
    let instanceName = 'PPA';

    const idIndex = data.series[0].fields.findIndex((f) => f.name === pointIDField);
    if (idIndex === -1) 
      throw new Error('Unable to find Point ID field in data series Please add ID to Meta Data Request');

    data.series.forEach((element) => {

      if (element.fields[idIndex].values.length === 0) 
        return;


      const dat = element.fields[idIndex].values[0]
      const id = dat.split(':');
      instanceName = id[0].trim();
      pointIDs.push(id[1].trim());
    });

    setPointIDs(pointIDs);
    setInstance(instanceName);

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
