import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Label = styled.span`
  color: #ffffff;
  font-size: 14px;
  line-height: 150%;
  padding-left: 24px;
  min-width: fit-content;
  margin-bottom: 0 !important;
`;

const Input = styled.input.attrs(_ => ({
  type: 'range'
}))`
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  border-radius: 5px;
  background: #ffffff;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #ffffff !important;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
  }
`;

export default class Slider extends React.Component {

  constructor(props) {
    super(props);

    const { value } = props;
    this.state = {
      currValue: value
    };
  }

  onInput = ({ target }) => {
    const { onChange } = this.props;
    this.setState({ currValue: target.value });
    onChange(target.value);
  };

  render() {
    const {
      min,
      max,
      value,
      unitLabel
    } = this.props;

    const { currValue } = this.state;

    return (
      <Wrapper>
        <Input min={min} max={max} defaultValue={value} onInput={this.onInput} />
        <Label>{`${currValue} ${unitLabel}`}</Label>
      </Wrapper>
    );
  }
}
