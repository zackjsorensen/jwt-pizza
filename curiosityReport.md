Curiosity Report

For my report, I wanted to dive deeper into Docker. Initially I wanted to understand the pieces of Docker better, because that wasn't very clear to me as I worked on deliverables and exercises. After that, I decided to build a very simple multi-container app to see how 2 different containers could communicate with each other. 

The pieces that make up Docker
	- Docker daemon - the engine that runs commands, accessed through the Docker CLI
	- Image: Instructions on how to build a container with all needed dependencies
	- Container: a built, running piece of software that can be run across different computing environments
	- Docker service: lets containers talk to each other

That last piece, the Docker service allowing communication between containers, had me intrigued. How did different containers communicate? I learned the following: 

Splitting an app up into multiple containers has a few benefits:
	- Follows the single responsibility principle
	- You can create multiple copies of just one container, say the backend service container, without needing to scale everything else
	- You don't have to have all of your app stored on one piece of hardware - it can be spread out because all of the container pieces are independent

To commuincate, the containers needed a network. That network can be created manually, or in a docker-compose file. Docker-compose let you define the interactions between multiple containers. You can create multiple networks and only allow certain containers on each one as a way to restrict access and further isolate and secure your app components. 

With my Docker-compose (shown below), the following was set:
	- private virtual network for my containers to talk on was created and named app-network
	- the Service container was given the name api-server. The client code uses this as the hostname of the server, since localhost: won't work the same inside containers (I tried that...)
	- the client container was given the name frontend-client
	- Both containers were told to use the app-network 




I tried removing the networks: app-network from the client piece in Docker-compose and ran everything. This was the result: <img width="1557" height="1129" alt="image" src="https://github.com/user-attachments/assets/4b452263-c5fc-4aec-b039-d59bdab889f5" />
