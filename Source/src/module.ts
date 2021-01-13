import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { ExportDataPanel } from './ExportDataPanel';

export const plugin = new PanelPlugin<SimpleOptions>(ExportDataPanel).setPanelOptions(builder => {
  return builder
    .addNumberInput({
      path: 'Rate',
      name: 'Frame Rate',
      description: 'Rate of the data',
      defaultValue: 30,
      settings: {
        min: 0,
      }
    })
    .addSelect({
      path: 'RateBase',
      name: 'Frame Rate in',
      defaultValue: 'frames per second',
      settings: {
        options: [
          {label: 'frames per second', value: 'frames per second'},
          {label: 'frames per minute', value: 'frames per minute'},
          {label: 'frames per hour', value: 'frames per hour'},
      ],
      }
    })
    .addSelect({
      path: 'FirstTS',
      defaultValue:'first available measurement',
      name: 'First Timestamp Based On',
      settings: {
        options: [
          {label: 'first available measurement', value: 'first available measurement'},
          {label: 'exact start time', value: 'exact start time'}
      ],
      }
    }).addBooleanSwitch({
      path: 'AlignT',
      defaultValue: true,
      name: 'Align Timestamps',
    }).addBooleanSwitch({
      path: 'ExportNaN',
      defaultValue: true,
      name: 'Export Missing Values as NaN',
    }).addBooleanSwitch({
      path: 'MissingTS',
      defaultValue: true,
      name: 'Fill-in Missing Timestamps',
      description: "Export timestamps with monotonically increasing time based on frame rate with no missing rows, i.e., when no data is archived for a timestamp, write a blank row and don’t skip times."
    }).addBooleanSwitch({
      path: 'Round',
      defaultValue: true,
      name: 'Round to Frame Rate Timestamps',
      description: "Exporting with timestamps rounded to closest frame rate will export <b>generated</b> timestamps with data matched into closest alignment. " +
                  "Note that this will result in an export where timestamp values do not match original data, but are sorted into closest timestamps. " +
                  "This is similar to how \"concentration\" features operate when using synchrophasor data."
    }).addTextInput({
      path: 'Link',
      defaultValue: '..',
      name: 'OH Link Address',
    })
    .addSelect({
      path: 'FontSize',
      defaultValue: 100,
      name: 'Font Size',
      settings: {
        options: [
          {label: '100%', value: 100},
          {label: '110%', value: 110},
          {label: '300%', value: 300}
      ],
      }
    }).addColorPicker({
      path: "TextColor",
      defaultValue: "#ffffff",
      name: 'Text Color',
    }).addColorPicker({
      path: "Color",
      defaultValue: "#ff0000",
      name: 'Color',
    })
});
