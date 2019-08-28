const orgSelectStyles = {
  container: (base, state) => {

    const { isDisabled } = state;
    return {
      ...base,
      cursor: isDisabled ? 'not-allowed' : 'default',
      marginLeft: '30px',
      pointerEvents: 'auto',
      width: '300px'
    };
  },
  control: (base, state) => {

    const { isFocused, isDisabled, selectProps } = state;
    let backgroundColor = isFocused ? '#4F4E54' : '#36353B';
    let border = isFocused ? '1px solid #98979D' : 'none';

    if (selectProps && selectProps.noBorder) {
      backgroundColor = 'transparent';
      border = 'none';
    }

    const style = {
      backgroundColor,
      border,
      borderRadius: '3px',
      boxShadow: 'none',
      fontSize: '12px',
      lineHeight: 'normal',
      minHeight: '30px',
      pointerEvents: isDisabled ? 'none' : 'auto',
      ':hover': {
        backgroundColor,
        border,
      },
    };
    return { ...base, ...style };
  },
  menuList: base => ({ ...base, borderRadius: '4px' }),
  menuPortal: base => ({ ...base, zIndex: 550 }),
  menu: (base, state) => {
    const { selectProps } = state;
    const display = (selectProps && selectProps.hideMenu) ? 'none' : 'block';
    return {
      ...base,
      display,
      zIndex: 500,
      backgroundColor: '#36353B',
      boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)'
    };
  },
  option: (base, state) => {

    const { isFocused, isSelected } = state;
    let color = isSelected ? '#FFFFFF' : '#CAC9CE';
    let backgroundColor = '#36353B';

    if (isSelected) {
      color = '#FFFFF';
      backgroundColor = '#4F4E54';
    }
    else if (isFocused) {
      color = '#FFFFF';
      backgroundColor = '#4F4E54';
    }

    return {
      ...base,
      color,
      backgroundColor,
      fontSize: '12px',
      ':active': {
        backgroundColor: '#36353B'
      }
    };
  },
  singleValue: (base, state) => {
    const { isDisabled } = state;
    return { ...base, color: isDisabled ? '#807F85' : '#FFFFFF' };
  },
  indicatorSeparator: () => ({ display: 'none' }),
  indicatorsContainer: base => ({ ...base, marginRight: '5px', color: '#CAC9CE' }),
  clearIndicator: base => ({ ...base, padding: '0', margin: '5px' }),
  dropdownIndicator: (base, state) => {
    const { selectProps } = state;
    const style = {
      color: '#CAC9CE',
      padding: '0',
      margin: '4px',
      display: selectProps && selectProps.hideMenu ? 'none' : 'flex'
    };
    return { ...base, ...style };
  },
  valueContainer: base => ({ ...base, padding: '0 10px' }),
};

export { orgSelectStyles };
