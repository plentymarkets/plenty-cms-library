/**
 * Licensed under AGPL v3
 * (https://github.com/plentymarkets/plenty-cms-library/blob/master/LICENSE)
 * =====================================================================================
 * @copyright   Copyright (c) 2015, plentymarkets GmbH (http://www.plentymarkets.com)
 * @author      Felix Dausch <felix.dausch@plentymarkets.com>
 * =====================================================================================
 */

/**
 * @module Services
 */
(function( $, pm )
{

    pm.service( 'FeedbackService', function( API )
    {

        return {
            getFeedbacks : getFeedbacks,
            addFeedback  : addFeedback,
            ArticleTypes : articleTypes(),
            FeedbackTypes: feedbackTypes()
        };

        /*
         FeedbackService
         .getFeedbacks().between('2014-12-03', '2015-07-01')
         .for( FeedbackService.ArticleTypes.ITEM, 2732, FeedbackService.FeedbackTypes.COMMENTS_ONLY );
         */
        function getFeedbacks()
        {
            var feedbackInterval = {
                dateStart: null,
                dateEnd  : null
            };

            return {
                between: setFeedbackInterval,
                for    : listFeedbacks
            };

            function setFeedbackInterval( start, end )
            {
                feedbackInterval.dateStart = start;
                feedbackInterval.dateEnd   = end;
                return this;
            }

            function listFeedbacks( articleType, referenceId, feedbackType )
            {

                var params = {
                    ReferenceId : referenceId,
                    FromDate    : feedbackInterval.dateStart,
                    ToDate      : feedbackInterval.dateEnd,
                    FeedbackType: feedbackType || feedbackTypes().COMMENTS_AND_RATINGS
                };
                return API.get( '/rest/feedback/' + articleType + '/', params );

            }
        }

        /*
         FeedbackService
         .addFeedback()
         .withRating( 5 )
         .withComment( 'Hallo' )
         .withAuthor( 'Felix', 'felix.dausch@plentymarkets.com', 123456 )
         .to( FeedbackService.ArticleTypes.ITEM, 2732 );
         */
        function addFeedback()
        {

            var params = {
                Rating    : 1.0,
                Text      : '',
                Author    : '',
                Email     : '',
                CustomerId: 0
            };

            return {
                withRating : withRating,
                withComment: withComment,
                withAuthor : withAuthor,
                to         : sendFeedback
            };

            function withRating( rating )
            {
                params.Rating = rating;
                return this;
            }

            function withComment( comment )
            {
                params.Text = comment;
                return this;
            }

            function withAuthor( author, mail, customerID )
            {
                params.Author = author;
                if ( !!mail )
                {
                    params.Email = mail;
                }
                if ( !!customerID )
                {
                    params.CustomerId = customerID;
                }
                return this;
            }

            function sendFeedback( articleType, referenceId )
            {
                return API.post( '/rest/feedback/' + articleType + '/', params );

            }

        }

        function feedbackTypes()
        {
            return {
                COMMENTS_ONLY       : 'comments_only',
                RATINGS_ONLY        : 'ratings_only',
                COMMENTS_AND_RATINGS: 'comments_with_ratings'
            }
        }

        function articleTypes()
        {
            return {
                ITEM    : 'item',
                CATEGORY: 'category',
                BLOG    : 'blog'
            }
        }

    }, ['APIFactory'] );
}( jQuery, PlentyFramework ));