import React from 'react';
import styled, { keyframes } from 'styled-components';

// Keyframes for the blinking animation
const blink = keyframes`
  from {
    background: rgb(100,100,135);
    box-shadow: 0 0 0 transparent;
  }
  to {
    background: rgb(160,160,255);
    box-shadow: 0 0 15px rgb(160,160,255);
  }
`;

// Styled components for the elements
const Holder = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0c1122;
  font-family: 'Segoe UI', sans-serif;
`;

const Title = styled.h1`
  color: rgb(255,255,255);
  margin: 5vh auto auto auto;
  text-align: center;
  font-weight: 100;
  font-size: 20pt; /* Increased font size */
  text-shadow: 0 1px 2px rgb(0,0,0); /* Added more text shadow for better contrast */
`;

const Loader = styled.div`
  position: relative;
  margin: auto auto 5vh auto;
  width: 300px;
  height: 120px;
  background: rgb(60,60,60);
  border-radius: 6px;
  border: 1px solid rgb(20,20,20);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(255,255,255,.3), inset 3px 10px 15px rgb(80,80,80), 0 20px 15px rgba(0,0,0,.2);
  box-sizing: border-box;
  padding: 10px;
  font-size: 10pt; /* Increased font size */
  color: rgb(255,255,255); /* Changed text color */
  text-shadow: 0 1px 0 rgb(40,40,40);
`;

const LoaderLight = styled.div`
  position: absolute;
  top: 30px;
  left: 20px;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  border: 1px solid rgb(20,20,60);
  animation: ${blink} 1s alternate infinite;
`;

const LoaderDrives = styled.div`
  position: absolute;
  top: 30px;
  left: 46px;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const LoaderDrive = styled.div`
  position: relative;
  border-radius: 3px;
  border: 1px solid rgb(20,20,20);
  box-sizing: border-box;
  background: rgb(70,70,70);
  height: 48%;
  width: 32%;
  margin-bottom: 4px;
  box-shadow: 0 1px 0 rgba(255,255,255,.1), inset 0 2px 4px rgb(80,80,80);

  &:after,
  &:before {
    display: block;
    content: '';
    position: absolute;
    right: 5px;
    width: 5px;
    height: 5px;
    border-radius: 3px;
    border: 1px solid rgba(0,0,0,.7);
    animation: ${blink} 1s alternate infinite;
  }

  &:after {
    top: 6px;
  }

  &:before {
    bottom: 6px;
  }

  &:nth-child(1):before,
  &:nth-child(1):after {
    animation-duration: ${(Math.random() * 1 + 0.112)}s;
    animation-delay: ${(Math.random() * 1 + 0.254)}s;
  }

  &:nth-child(2):before,
  &:nth-child(2):after {
    animation-duration: ${(Math.random() * 1 + 0.112)}s;
    animation-delay: ${(Math.random() * 1 + 0.254)}s;
  }

  &:nth-child(3):before,
  &:nth-child(3):after {
    animation-duration: ${(Math.random() * 1 + 0.112)}s;
    animation-delay: ${(Math.random() * 1 + 0.254)}s;
  }

  &:nth-child(4):before,
  &:nth-child(4):after {
    animation-duration: ${(Math.random() * 1 + 0.112)}s;
    animation-delay: ${(Math.random() * 1 + 0.254)}s;
  }

  &:nth-child(5):before,
  &:nth-child(5):after {
    animation-duration: ${(Math.random() * 1 + 0.112)}s;
    animation-delay: ${(Math.random() * 1 + 0.254)}s;
  }

  &:nth-child(6):before,
  &:nth-child(6):after {
    animation-duration: ${(Math.random() * 1 + 0.112)}s;
    animation-delay: ${(Math.random() * 1 + 0.254)}s;
  }
`;

const Dashboard = ({ Dashboard }) => {
  return (
    <Holder>
      <Loader>
        {Dashboard && Dashboard.name ? `${Dashboard.name} Server 000` : 'Server 000'}
        <LoaderLight />
        <LoaderDrives>
          <LoaderDrive />
          <LoaderDrive />
          <LoaderDrive />
          <LoaderDrive />
          <LoaderDrive />
          <LoaderDrive />
        </LoaderDrives>
      </Loader>
      <Title>
        We're currently installing some updates.
        <br />
        Please check back later...
      </Title>
    </Holder>
  );
};

export default Dashboard;
