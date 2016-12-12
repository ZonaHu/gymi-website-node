// Defines an express app that runs the boilerplate codebase.

import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import requestLanguage from 'express-request-language';
import cookieParser from 'cookie-parser';

import { ApplicationError } from './errors';
import users from './routes/users';
import interests from './routes/interests';
import topics from './routes/topics';
import sessions from './routes/sessions';
import submissions from './routes/submissions';
import submissionQuestions from './routes/submissionQuestions';
import emails from './routes/emails';
import { handleRender } from './serverRendering';
import { LANGUAGE_KEY } from '../frontend_app/reducers/language';

export default function createRouter() {
  const router = express.Router(); // eslint-disable-line new-cap

  // static assets; this includes the compiled frontend app!
  router.use(express.static(path.join(__dirname, '..', 'public')));

  router.use(cookieParser());
  router.use(requestLanguage({
    languages: ['en', 'zh'],
    cookie: {
      name: LANGUAGE_KEY,
      options: { maxAge: 10 * 365 * 24 * 60 * 60 * 1000 }, // 10 yrs from now
    },
  }));
  router.use(bodyParser.json()); // parse json bodies

  /**
   * Uncached routes:
   * All routes that shouldn't be cached (i.e. non-static assets) should have these headers to
   * prevent 304 Unmodified cache returns. This middleware applies it to all subsequently
   * defined routes.
   */
  router.get('/*', (req, res, next) => {
    res.set({
      'Last-Modified': (new Date()).toUTCString(),
      Expires: -1,
      'Cache-Control': 'must-revalidate, private',
    });
    next();
  });

  // *****************
  // * DEFINE ROUTES *
  // *****************

  /**
   * API Endpoints
   */

  /*
   * send inquiry/press email
   */
  router.post('/api/emails', emails.send);

  /*
   * users endpoints
   */
  // authenticate. Returns a json web token to use with requests.
  router.post('/api/sessions', sessions.authenticate);
  router.get('/api/users', sessions.verify, users.list);
  router.get('/api/users/:identifier', sessions.verify, users.find);
  router.post('/api/users', sessions.populate, users.create);
  // sets a user's password
  router.patch('/api/users/:userId/credentials', sessions.verify, sessions.setCredentials);

  /*
   * interests endpoints
   */
  router.get('/api/users/:userId/interests', sessions.verify, interests.list);
  router.post('/api/users/:userId/interests', sessions.verify, interests.add);
  router.delete('/api/users/:userId/interests', sessions.verify, interests.remove);

  /*
   * submissions endpoints
   */
  router.get('/api/users/:userId/submissions', sessions.verify, submissions.list);
  router.get('/api/submissions', sessions.verify, submissions.list);
  router.post('/api/users/:userId/submissions', sessions.verify, submissions.create);

  /*
   * topics endpoints
   */
  router.get('/api/topics', sessions.verify, topics.list);
  router.post('/api/topics', sessions.verify, sessions.assertRole('admin'), topics.create);
  router.delete('/api/topics', sessions.verify, sessions.assertRole('admin'), topics.destroy);

  /*
   * submission questions endpoints
   */
  router.get(
    '/api/submissionQuestions', sessions.verify, submissionQuestions.list,
  );
  router.post(
    '/api/submissionQuestions', sessions.verify, sessions.assertRole('admin'),
    submissionQuestions.create,
  );
  router.delete(
    '/api/submissionQuestions', sessions.verify, sessions.assertRole('admin'),
    submissionQuestions.destroy,
  );

  router.all('/api/*', (req, res, next) => {
    next(new ApplicationError('Not Found', 404));
  });

  router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err instanceof ApplicationError) {
      res.status(err.statusCode).send({
        message: err.message,
        data: err.data || {},
      });
      return;
    }

    // log the error for debugging
    console.error(err); // eslint-disable-line no-console
    res.sendStatus(500); // uncaught exception
  });


  /**
   * Frontend app catch-all hook
   */
  // all other pages route to the frontend application.
  router.get('/*', handleRender);

  return router;
}
