'use strict';

import BaseController from '../../commons/base-controller';
import HTTPStatus from 'http-status';
import Business from './docs-business';
import FileType from 'file-type';
import google from 'googleapis';
import { gapi } from './gapi';
import _ from 'lodash';
import fs from 'fs';

export default class DocsController extends BaseController {
  constructor () {
    super();
    this._business = new Business();
  }

  buildResponse () {
    return (entity) => {
      return entity;
    };
  }

  list (request, reply) {
    let options = {
      headers: _.cloneDeep(request.headers),
      query: _.cloneDeep(request.query)
    };

    return this._business.findAll(options)
      .then(this.buildResponse())
      .then((response) => reply.success(response, options).code(HTTPStatus.OK))
      .catch(super.error(reply));
  }

  create (request, reply) {
    const data = request.payload;
    const allowed = ['image/gif', 'image/png', 'image/jpeg', 'image/bmp', 'image/webp'];

    const file = {
      data: data.file,
      info: FileType(data.file) || { mime: false }
    };

    const options = {
      headers: _.cloneDeep(request.headers),
      payload: _.cloneDeep(request.payload)
    };

    if (allowed.includes(file.info.mime)) {

      gapi()
        .then((auth) => {
          const drive = google.drive({ version: 'v2', auth: auth });

          drive.files.insert({
            resource: {
              title: data.name,
              mimeType: file.info.mime
            },
            media: {
              mimeType: file.info.mime,
              body: file.data
            }
          }, (err, res) => {
            return reply(res).code(200);
          });

        })
        .catch((err) => {
          return reply('Error at authentication: ', err).code(500);
        });

    } else {
      return super.error(reply)({ errorCode: '20090', parameters: 'file' });
    }

    /*
    return this._business.create(options)
      .then(this.buildResponse())
      .then((response) => reply.success(response, options).code(HTTPStatus.CREATED))
      .catch(super.error(reply));
    */
  }

  read (request, reply) {
    let options = {
      headers: _.cloneDeep(request.headers),
      params: _.cloneDeep(request.params)
    };

    return this._business.byId(options)
      .then(this.buildResponse())
      .then((response) => reply.success(response, options).code(HTTPStatus.OK))
      .catch(super.error(reply));
  }

  update (request, reply) {
    let options = {
      headers: _.cloneDeep(request.headers),
      params: _.cloneDeep(request.params),
      payload: _.cloneDeep(request.payload)
    };

    return this._business.update(options)
      .then(this.buildResponse())
      .then((response) => reply.success(response, options).code(HTTPStatus.OK))
      .catch(super.error(reply));
  }

  remove (request, reply) {
    let options = {
      headers: _.cloneDeep(request.headers),
      params: _.cloneDeep(request.params)
    };

    return this._business.delete(options)
      .then((response) => reply.success(response, options).code(HTTPStatus.NO_CONTENT))
      .catch((err) => {
        console.log(err);
        super.error(reply)
      });
  }
}