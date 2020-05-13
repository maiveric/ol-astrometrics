import React from 'react';
import {
  DatePicker,
  DateTimePicker,
  ThemeProvider,
  MuiPickersUtilsProvider,
  LatticeLuxonUtils,
  darkTheme
} from 'lattice-ui-kit';

const StyledDateTimePicker = (props) => {

  const { onChange, value } = props;

  return (
    <ThemeProvider theme={darkTheme}>
      <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
        <DateTimePicker isDark {...props} onChange={onChange} value={value} />
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export const StyledDatePicker = (props) => {

  return (
    <ThemeProvider theme={darkTheme}>
      <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
        <DatePicker {...props} />
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default StyledDateTimePicker;
