"use strict";

var gcloud = require('gcloud');
var config = require('../config');
var logging = require('./logging');

var topicName = 'book-process-queue';
var subscriptionName = 'shared-worker-subscription';


module.exports = function(gcloudConfig, logging){

  var pubsub = gcloud.pubsub(config.gcloud);


  /*
    This configuration will automatically create the topic if
    it doesn't yet exist. Usually, you'll want to make sure
    that a least one subscription exists on the topic before
    publishing anything to it as topics without subscribers
    will essentially drop any messages.
  */
  var topic = pubsub.topic(topicName, {
    autoCreate: true
  });


  /*
    Used by the worker to listen to pubsub messages.
    When more than one worker is running they will all share the same
    subscription, which means that pub/sub will evenly distribute messages
    to each worker.
  */
  function subscribe(cb) {
    topic.subscribe(subscriptionName, {
      autoAck: true,
      reuseExisting: true
    }, function(err, subscription) {

      subscription.on('message', function(message) {
        cb(message.data);
      });

      logging.info("Listening to " + topicName + " with subscription " + subscriptionName);
    });
  }


  /*
    Adds a book to the queue to be processed by the worker.
  */
  function queueBook(bookId, cb) {
    topic.publish({
      data: {
        action: 'processBook',
        bookId: bookId
      }
    }, function(err) {
      if (err) {
        logging.error("Error occurred while queuing background task", err);
      } else {
        logging.info("Book " + bookId + " queued for background processing");
      }
      if(cb) cb();
    });
  }


  return {
    subscribe: subscribe,
    queueBook: queueBook
  };

};
