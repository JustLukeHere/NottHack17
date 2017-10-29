# NottHack17
Nottingham University Hackathon 2017
For this hackathon we decieded to create a game very similar to agar.io.
We wanted to practise using Node JS with sockets.io so that we can create web-based mutliplayer games in future hacks more effecitently.

Our web host was DigitalOcean - we wanted to use AWS but after waiting 7 hours for them to fix my account we gave up and found an alternative.
By the time presentations came we had a fully functional (yet simple) version of agar.io working. 

However it isn't without faults.

As I wanted to ensure there were no cheaters, the server handled as much of the information as possible.
This meant that the client only sent user input and drew the server output: the client did no manipulation of the shared data.
As a result there was an incredibly heavy load on the CPU of the server and it lagged with more than 2 players.

Unfortunately there are also random lag spikes but that's probably to do with CPU overload and something only more money can resolve.
Please note however, that the server does not crash and the client does not error: we managed to sucessfully handle it.


Now that the hackathon is finished I will branch it and move more to the client side to lower the strain on the server.
I also plan to add a chat system and bring in agar.io's more complex features such as splitting, merging, and mass ejection.




A simple, but fully functional, agar.io clone. Incredibly intense on server CPU, very little memory used. This was the state of the project when it was presented.
