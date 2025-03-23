import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('Renders Logs Header', () => {
  render(<App />);
  const TimeElement = screen.getByText(/Time/i);
  expect(TimeElement).toBeInTheDocument();

  const EventElement = screen.getByText(/Event/i);
  expect(EventElement).toBeInTheDocument();
});
