// Root component of the React app that integrates Context Providers and routing.
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
