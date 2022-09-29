# Math Drills
Math Drills Server

Achieve math mastery through continuous testing.

Math Drills is still in early development and is hosted here: https://drills.vercel.app

The developer is looking for a good job. Contact frtnx@protonmail.com

[![Math Drills home page](src/assets/images/readme/1.png?raw=true "Math Drills Summation")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/1.png)

## The Idea
Military-style drills, for math.

Math Drills offers a near infinite number of questions to sharpen the mind on. Currently most common math operations are supported, and more are constantly being added. Eventually the drills will encompass all of mathematics at every level.


## Features

## Built-in Terminal
Math Drills features a built in terminal. The terminal may be used to talk to Drillbot, the resident AI. The terminal may also be used to communicate with other users. More details below.

## Conversational AI: Drillbot
[![Math Drills Terminal](src/assets/images/readme/drillbot.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/drillbot.gif)


All input made outside a chat channel is processed by Drillbot. Talk about anything. It still has a long way to go but it already makes for fun interactions.


## Live Chats: Infinite Chat Channels
[![Math Drills Terminal](src/assets/images/readme/channels.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/channels.gif)

Join an existing channel or create a new one with the ```/join <channelname>``` command. If the channel does not exist it will be created with you as the owner. There is no limit to the number of channels you can create, no limit on the number of users in any channel. This may change if abused. 

## Unique Identifiers: Custom Aliases
[![Math Drills Terminal](src/assets/images/readme/aliases.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/aliases.gif)

Set a unique alias so other users know who you are. For display purposes, aliases are limited to 5 characters (emojis and symbols work too). The 5 character limit will likely be dropped once the IRC integrations kick into gear. You can change your alias as often as you like. If the alias isn't already used by someone else, its yours for the taking.

## Flexibility: Channel Ownership Transfer

When you create a new channel you become its owner. Owning a channel allows you to manage its content with commands like ```/nuke``` (see Channel Management section below). Sometimes it is desirable to let other trusted users manage the channel. This can be done by enabling the ```/chown``` command on your channel:
[![Math Drills Terminal](src/assets/images/readme/chown1.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/chown1.gif)

Once enabled, simply share the channel name and password with your trusted circle. These trusted users will then be able to assume channel ownership:
[![Math Drills Terminal](src/assets/images/readme/chown2.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/chown2.gif)

You can easily disable ```/chown``` or change the transfer password. Type in ```/chown help``` outside a channel for a list of ```/chown``` options. Note that only one user may have ownership of a channel at any point in time, so choose your circle wisely.

TIP: This feature is especially useful when you create a channel as an anonymous user and would like to transfer channel ownership to other (anonymous or regular) users.

## Channel Management: Tactical Nukes with ```/nuke```

The ```/nuke``` command allows you to delete all messages in a channel or all messages from a specific user. It behaves very much like the Thanos gauntlet, except less random. To delete delete activity by user:
[![Math Drills Terminal](src/assets/images/readme/nuke1.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/nuke1.gif)

And to nuke all channel activity:
[![Math Drills Terminal](src/assets/images/readme/nuke2.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/nuke2.gif)

## Privacy: Anonymous Login
Math Drills does not care who you are. You can login anonymously with one click, without providing your name and email or setting a password. The only limitation to anonymous users is the ability to set custom aliases (as that would be self-defeating).

[![Math Drills Terminal](src/assets/images/readme/anonymous.png?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/anonymous.png)

## Hints
To get a hint about the current question simply hover your mouse over it. On mobile you can hold the area on the right hand side of the question to the same effect. This displays a unique tooltip for every operation and every level within each operation.

[![Math Drills home page 2](src/assets/images/readme/2.png?raw=true "Math Drills Exponents Tooltip")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/2.png)

## Performance Stats
Users can keep track of their performance using the performance stats page.

[![Math Drills stats page](src/assets/images/readme/3.png?raw=true "Math Drills Stats 1")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/3.png)

Here users have access to a variety of stats that help keep track of their progress. All active user operations may be toggled and compared. Eventually this data will be displayed more competitively, with features like a leaderboard to help motivate users. 

[![Math Drills stats page 2](src/assets/images/readme/4.png?raw=true "Math Drills Stats 2")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/4.png)

Users can also keep track of their speed per operation.

[![Math Drills stats page 3](src/assets/images/readme/5.png?raw=true "Math Drills Stats 3")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/5.png)

## What's next?
Some features are already in the pipeline to give more life to this web application:

* irc bridge - This will allow Math Drills users to interact with IRC (liberachat) users. Currently the plan is to limit users to the irc ##math-drills channels as well as the ##math channel. So for example, if a user gets stuck on a drill, they can easily ask the internal Math Drills comminity, or login to IRC and ask their question(s) there.

* leaderboard - We all enjoy being the best in the world at something. The incoming leaderboard feature will help cultivate a competitive spirit amongst users.

* math games - A set of unique math games users can play with each other.

* recommendation engine - An AI-powered recommendation engine that identifies the best set of drills for each user.

* syllabus-oriented drills - This will give users access to questions related to a specific syllabus and help them prepare for exams.

* classrooms - Drill rooms + observation streams/endpoints for educators.

## Contributions
Contributions are welcome.

### Update
TypeScript conversion complete.

Developer contact: frtnx@protonmail.com
