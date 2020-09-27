/** @jsx h */
import { h, render } from 'preact';
import App from './App';

const element = document.getElementById('root');

if (element) {
  render(<App />, element);
}
