"use strict";

var express = require('express');
var bodyParser = require('body-parser');


module.exports = function(model) {

  var router = express.Router();

  router.use(bodyParser.json());


  function handleRpcError(err, res) {
    if (err.code == 404) return res.status(404);
    res.status(500).json({
      message: err.message,
      internalCode: err.code
    });
  }


  router.get('/', function list(req, res) {
    model.list(10, req.query.pageToken,
      function(err, entities, cursor) {
        if (err) return handleRpcError(err, res);
        res.json({
          items: entities,
          nextPageToken: cursor
        });
      });
  });


  router.post('/', function insert(req, res) {
    model.create(req.body, function(err, entity) {
      if (err) return handleRpcError(err, res);
      res.json(entity);
    });
  });


  router.get('/:image(\\d+)', function get(req, res) {
    model.read(req.params.image, function(err, entity) {
      if (err) return handleRpcError(err, res);
      res.json(entity);
    });
  });


  router.put('/:image(\\d+)', function update(req, res) {
    model.update(req.params.image, req.body, function(err, entity) {
      if (err) return handleRpcError(err, res);
      res.json(entity);
    });
  });


  router.delete('/:image(\\d+)', function _delete(req, res) {
    model.delete(req.params.image, function(err) {
      if (err) return handleRpcError(err, res);
      res.status(200).send('OK');
    });
  });

  return router;

};
