import React from 'react';
import { DatePicker, DateTimePicker } from '@atlaskit/datetime-picker';
import styled from 'styled-components';

const NEUTRALS :string[] = [
  '#555e6f',
  '#8e929b',
  '#b6bbc7',
  '#cdd1db',
  '#dcdce7',
  '#eaeaf0',
  '#f0f0f7',
  '#f5f5f8',
  '#f9f9fd',
];

const PURPLES :string[] = [
  '#410ab5',
  '#6124e2',
  '#8045ff',
  '#b898ff',
  '#d0bbff',
  '#e4d8ff',
  '#e6e6f7',
];

const styles = {
  container: (base, state) => {
    const { isDisabled } = state;
    return {
      ...base,
      cursor: isDisabled ? 'not-allowed' : 'default',
      pointerEvents: 'auto',
      width: '100%'
    };
  },
  control: (base, state) => {
    const { isFocused, isDisabled, selectProps } = state;
    const defaultBackgroundColor = '#36353B';

    const style = {
      backgroundColor: isFocused ? '#4F4E54' : defaultBackgroundColor,
      borderRadius: '3px',
      border: isFocused ? '1px solid #98979D' : 'none',
      boxShadow: 'none',
      color: '#ffffff',
      fontSize: '14px',
      minHeight: '40px',
      pointerEvents: isDisabled ? 'none' : 'auto',
      transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
      ':hover': {
        backgroundColor: '#4F4E54'
      }
    };
    return { ...base, ...style };
  },
  input: (base, state) => {
    const style = {
      color: '#ffffff'
    }

    return { ...base, ...style };
  },
  menuPortal: base => ({ ...base, zIndex: 550 }),
  menu: (base, state) => {
    const { selectProps } = state;
    const display = (selectProps && selectProps.hideMenu) ? 'none' : 'block';
    return { ...base, display };
  },
  option: (base, state) => {
    const { isFocused, isSelected } = state;
    const color = isSelected ? PURPLES[1] : NEUTRALS[0];
    let backgroundColor = 'white';

    if (isSelected) {
      backgroundColor = PURPLES[6];
    }
    else if (isFocused) {
      backgroundColor = NEUTRALS[6];
    }

    return {
      ...base,
      color,
      backgroundColor,
      ':active': {
        backgroundColor: PURPLES[5]
      }
    };
  },
  singleValue: (base, state) => {
    const { isDisabled } = state;
    return { ...base, color: isDisabled ? NEUTRALS[1] : 'inherit' };
  },
  indicatorSeparator: () => ({ display: 'none' }),
  indicatorsContainer: (base) => ({ ...base, marginRight: '10px', color: NEUTRALS[2] }),
  clearIndicator: (base) => ({ ...base, padding: '0', margin: '5px' }),
  dropdownIndicator: (base, state) => {
    const { selectProps } = state;
    const style = {
      color: NEUTRALS[2],
      padding: '0',
      margin: '5px',
      display: selectProps && selectProps.hideMenu ? 'none' : 'flex'
    };
    return { ...base, ...style };
  },
};

const StyledDateTimePicker = (props) => {

  const { onChange } = props;

  const allProps = {
    timeIsEditable: true,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm a',
    datePickerSelectProps: { styles },
    timePickerSelectProps: { styles },
    onChange: (time) => {
      const submitTime = (time).replace(/['pm','am'].*$/g, '');
      onChange(submitTime);
    },
    innerProps: {
      style: { border: 'none' }
    }
  };

  return <DateTimePicker {...props} {...allProps} />;
};

export const StyledDatePicker = (props) => {

  const allProps = {
    dateFormat: 'MM/DD/YYYY',
    selectProps: { styles },
    innerProps: {
      style: { border: 'none' }
    }
  };

  return <DatePicker {...props} {...allProps} />;
};

export default StyledDateTimePicker;
