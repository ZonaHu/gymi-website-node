/* eslint-disable max-len */
import sessions from './sessions';
import username from './username';
import password from './password';
import newSubmission from './newSubmission';

export default [
  ...sessions,
  ...username,
  ...password,
  ...newSubmission,
  {
    id: 'errors.unexpected',
    defaultMessage: 'Sorry, something went wrong! Please try again.',
  },
  {
    id: 'errors.required',
    defaultMessage: 'Required',
  },
  {
    id: 'errors.invalidEmail',
    defaultMessage: 'Invalid email address',
  },
  {
    id: 'errors.noneFound',
    defaultMessage: 'None found',
  },
];
