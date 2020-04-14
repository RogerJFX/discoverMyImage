Discover My Image
-
Client part of 

https://discover-my-image.com

To run integration tests against production server, type

    npm run test-prod
    
Logical server part written in Scala will not be published due to massive memory consumption. Cassandra needs some memory, too.

More, there are creating routines on server side, that needs at least 256g of RAM. I am sorry, I can't publish all that.

There are no unit tests so far. Since it is a private project, I consider this ok for the moment. There is a proof of
concept using Cypress for unit testing, though. Yes, it should work. I really would be happy, if the Cypress dudes 
would make up their mind to make Cypress an official unit testing framework as well.

If You want to run

    npm run test
    
make sure you have host 'crazything' registered in /etc/hosts. Otherwise, some backend service should reject 
any request due to Cors.

Of course You then need to put that code to a web server like nginx. Just put it to dir \[webserverRoot\]/discoverMyImage.

Got all that? Ok then, lets type:

     npm run test-coverage
     
to have the coverage done. If you have a unix box, ok, should work. Otherwise, simply make up your mind and get done with Mr. Gates and his incredible bullshit.
