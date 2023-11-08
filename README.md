## Installation

Pull the image: `docker pull [image-name]`

Create new volume: `docker volume create [volume-name]`

Run with volume: `docker run -d -v 
 -p [host-port]:[container-port] [image-name]`

Stop container: `docker stop [container-id or name]`

Restart in the same volume (data remains): `docker run -d -v [volume-name]:/path/in/container -p [host-port]:[container-port] [image-name]`

Clenup:
`docker rm [container-id or name]`
`docker volume rm [volume-name]`

`docker build --build-arg STORAGE_TYPE=aws --build-arg AWS_ACCESS_KEY_ID=your_id --build-arg AWS_SECRET_ACCESS_KEY=your_secret --build-arg S3_BUCKET_NAME=your_bucket --build-arg S3_REGION=your_region -t your_image .`
