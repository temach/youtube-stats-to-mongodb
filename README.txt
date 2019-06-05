For each youtube video link in input array, retrieves information for the video using youtube api and posts it to mongodb
running on the MongoDB Atlas service.

To configure edit input-videos.txt.
Each line is expected to be a fully qualified URL to a youtube video. Example below:
$ cat input-videos.txt
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/watch?v=A3AdN7U24iU
https://www.youtube.com/watch?v=GCsxYAxw3JQ

Before running please supply password values in ".env" file. See dotenv npm package for details. Example below:

$ cat .env
YOUTUBE_API_KEY=AIza___MY_YOUTUBE_API_KEY___XfU7fDcbXn0
MONGO_USERNAME=admin
MONGO_PASSWORD=myadminpassword

References:
Module for abstracting youtube api called simple-youtube-api : https://hypercoder2975.github.io/simple-youtube-api/master/
Choosing 'part' argument to simple-youtube-api: https://developers.google.com/youtube/v3/docs/videos/list#part

MongoDB setup on the cloud: https://medium.com/@nparsons08/getting-started-with-mongodb-node-js-and-restify-f9fe1a1c451
Free mongodb hosting is done with MongoDB Atlas: https://www.mongodb.com/cloud/atlas
