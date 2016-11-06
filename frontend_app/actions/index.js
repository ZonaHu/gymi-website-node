import { browserHistory } from 'react-router';

// Actions define what events can cause application state to change. How the application state
// actually changes is defined by each reducer in the Redux store (see the store/ directory).

// Synchronous actions are just Javascript objects that contain a `type` and other metadata. The
// `type` allows the `store` to distinguish what action is occurring, and, if present, the Redux
// reducers can use the metadata in other fields to modify the state properly.
export function setCurrentLanguage(localeCode) {
  return { type: 'SET_CURRENT_LANGUAGE', localeCode };
}

export const loginRequest = { type: 'LOGIN_REQUEST' };
export function loginSuccess(token, user, remember) {
  return { type: 'LOGIN_SUCCESS', token, user, remember };
}
export function loginFailure(errMessage) {
  return { type: 'LOGIN_FAILURE', errMessage };
}
export function toggleLogInModal(show) {
  return { type: 'TOGGLE_LOGIN_MODAL', show };
}
export function logOut() {
  browserHistory.push('/');
  return { type: 'LOGOUT' };
}

// Asynchronous actions depend on redux-thunk to function correctly.  Asynchronous actions are
// functions that can dispatch synchronous actions as they please. Hence, this function receives
// `dispatch` as a parameter.
export function logIn(username, password, remember) {
  return (dispatch) => {
    dispatch(loginRequest);
    fetch('/api/sessions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }).then(response => Promise.all([response, response.json()])
    ).then(([response, responseData]) => {
      if (response.status === 200) {
        dispatch(loginSuccess(responseData.data.token, responseData.data.user, remember));
        dispatch(toggleLogInModal(false));
        browserHistory.push('/dreamProject');
        return;
      }
      let errMessage;
      switch (response.status) {
        case 400:
          // unexpected: form should catch this on frontend
          errMessage = 'errors.sessions.missingCredentials';
          break;
        case 401:
          errMessage = 'errors.sessions.badCredentials';
          break;
        default:
          errMessage = 'errors.sessions.unexpected';
      }
      dispatch(loginFailure(errMessage));
    }).catch(() => {
      dispatch(loginFailure('errors.unexpected'));
    });
  };
}

export function loadOwnSubmissionsRequest() {
  return { type: 'OWN_SUBMISSIONS_REQUEST' };
}

export function loadOwnSubmissionsFailure(err) {
  return { type: 'OWN_SUBMISSIONS_FAILURE', err };
}

export function loadOwnSubmissionsSuccess(submissions) {
  return { type: 'OWN_SUBMISSIONS_SUCCESS', submissions };
}

export function loadOwnSubmissions(userId, token) {
  return (dispatch) => {
    dispatch(loadOwnSubmissionsRequest());
    return fetch(`/api/users/${userId}/submissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => Promise.all([response, response.json()])
    ).then(([response, responseData]) => {
      if (response.status === 200) {
        dispatch(loadOwnSubmissionsSuccess(
          responseData.data.map(s => Object.assign({}, s, { timestamp: new Date(s.timestamp) }))
        ));
        return;
      }
      let errMessage;
      switch (response.status) {
        case 400:
          // unexpected: userId somehow wasn't a string
          errMessage = 'errors.unexpected';
          break;
        case 401:
          // probably token expired
          dispatch(logOut());
          browserHistory.push('/');
          dispatch(toggleLogInModal(true));
          errMessage = 'errors.unexpected';
          break;
        default:
          errMessage = 'errors.unexpected';
      }
      dispatch(loadOwnSubmissionsFailure(errMessage));
    }).catch(() => {
      dispatch(loadOwnSubmissionsFailure('errors.unexpected'));
    });
  };
}

export function loadOwnInterestsRequest() {
  return { type: 'OWN_INTERESTS_REQUEST' };
}

export function loadOwnInterestsFailure(err) {
  return { type: 'OWN_INTERESTS_FAILURE', err };
}

export function loadOwnInterestsSuccess(otherInterests, primaryInterest) {
  return { type: 'OWN_INTERESTS_SUCCESS', otherInterests, primaryInterest };
}

export function loadOwnInterests(userId, token) {
  return (dispatch) => {
    dispatch(loadOwnInterestsRequest());
    return fetch(`/api/users/${userId}/interests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => Promise.all([response, response.json()])
    ).then(([response, responseData]) => {
      if (response.status === 200) {
        dispatch(loadOwnInterestsSuccess(
          responseData.data.interests, responseData.data.primaryInterest)
        );
        return;
      }
      let errMessage;
      switch (response.status) {
        case 400:
          // unexpected: userId somehow wasn't a string
          errMessage = 'errors.unexpected';
          break;
        case 401:
          // probably token expired
          dispatch(logOut());
          browserHistory.push('/');
          dispatch(toggleLogInModal(true));
          errMessage = 'errors.unexpected';
          break;
        default:
          errMessage = 'errors.unexpected';
      }
      dispatch(loadOwnInterestsFailure(errMessage));
    }).catch(() => {
      dispatch(loadOwnInterestsFailure('errors.unexpected'));
    });
  };
}
