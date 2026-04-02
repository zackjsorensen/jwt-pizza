# Curiosity Report

For my report, I wanted to dive deeper into Docker. Initially I wanted to understand the pieces of Docker better, because that wasn't very clear to me as I worked on deliverables and exercises. After that, I decided to build a very simple multi-container app to see how 2 different containers could communicate with each other. 

## Anatomy of Docker (review)
The pieces that make up Docker
- Docker daemon - the engine that runs commands, accessed through the Docker CLI
- Image: Instructions on how to build a container with all needed dependencies
- Container: a built, running piece of software that can be run across different computing environments
- Docker service: lets containers talk to each other

So, an image is taken by the Docker daemon and turned into a running container. 

## Further learning
That last piece, the Docker service allowing communication between containers, had me intrigued. How did different containers communicate? I learned the following: 

Splitting an app up into multiple containers has a few benefits:
	- Follows the **single responsibility** principle
	- You can create multiple copies of just one container, say the backend service container, without needing to **scale** everything else
	- You don't have to have all of your app stored on one piece of hardware - it can be spread out because all of the container pieces are independent

To commuincate, the containers need a network. That network can be created manually, or in a docker-compose yaml file. Docker-compose let you define the interactions between multiple containers. You can create multiple networks and only allow certain containers on each one as a way to restrict access and further isolate and secure your app components. 

The docker-compose gives each container an alias that other containers use to refer to it. The docker service and docker daemon then map that alias to the IP address of the container. 

It's pretty amazing - with a docker-compose file, you define just a few key elements, and the docker service does all the heavy lifting. 

## Experiment 

To try this out for myself, I had Claude AI create a very simple http client and server. The client retrieves a different endpoint from the server every 5 second. Then, I added Docker files to each of the peojects. Finally, I added a docker-compose file:

<img width="1865" height="1249" alt="image" src="https://github.com/user-attachments/assets/2dcaf154-0f7b-4d05-b4d8-6f631b3bab90" />


With my Docker-compose  the following was set:
	- private virtual network for my containers to talk on was created and named app-network
	- the Service container was given the name api-server. The client code uses this as the hostname of the server, since localhost: won't work the same inside containers (I tried that...)
	- the client container was given the name frontend-client
	- Both containers were told to use the app-network 

I had the containers rebuilt and configured by the docker-compose specifications, and got the separate containers succesfully communicating: 



<img width="2528" height="730" alt="image" src="https://github.com/user-attachments/assets/eb482f8e-6271-4ab0-9f4d-6a1fbb87ddcd" />



I tried removing the networks: app-network from the client piece in Docker-compose and ran everything. This was the result: 

<img width="1523" height="701" alt="image" src="https://github.com/user-attachments/assets/17d020da-0028-4a68-a2de-453ce5779b23" />

Because it wasn't part of the correct network, my the hostname api-server was not mapped to the needed internal IP address. Once I restored the app-network definition everything worked again. 

## Conclusion
I know containers are something I will use a lot in the future, and so I wanted to solidfy my understaning of them. While reviewing the makeup of docker was helpful, it was fun to build a simple multi-container app and see how simple Docker makes inter-container communication, as well as think about the possibilities this tool offers. Docker-compose lets you manage interactions between containers, and even deploy clones of certain containers for scaling. I expect this knowledge to be especially useful as I start the sandbox program next year. In a start-up environment, lots of things, including computing environment, can change quickly. That makes the reliability and flexibility of images extra valuable, as we can quickly get our app running in a new environment with zero programming. I expect to continue to learn about and use images and docker and take this to the next level. 
