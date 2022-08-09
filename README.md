# Math Drills
Math Drills Server

Achieve math mastery through continuous testing.

Math Drills is still in early development and is hosted on Heroku here: https://math-drills-beta.herokuapp.com

[![Math Drills home page](src/assets/images/readme/1.png?raw=true "Math Drills Summation")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/1.png)

## The Idea
Military-style drills, for math.

Math Drills offers a near infinite number of questions to sharpen the mind on. Currently most common math operations are supported, and more are constantly being added. Eventually the drills will encompass all of mathematics at every level.

## Features
Built-in Terminal
[![Math Drills Terminal](src/assets/images/readme/md2.gif?raw=true "Math Drills Terminal + Drillbot")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/md2.gif)

Math Drills features a built in terminal. This terminal can be used to talk to DrillBot, the resident AI. More terminal features are currently being built, such as community channels that mimic irc, along with actual irc integrations. The terminal will typically be the main social feature as users will be able to have chats and ask questions through it.

So as to provide ease of access the terminal may be accessed from both the drills and the stats page or wherever the below icon appears, which allows the terminal to be expanded or hidden:
[![Math Drills Terminal 2](src/assets/images/readme/md3.gif?raw=true "Math Drills Terminal")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/md3.gif)
### Hints
To get a hint about the current question simply hover your mouse over it. On mobile you can hold the area on the right hand side of the question to the same effect. This displays a unique tooltip for every operation and every level within each operation.

[![Math Drills home page 2](src/assets/images/readme/2.png?raw=true "Math Drills Exponents Tooltip")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/2.png)

### Performance Stats
Users can keep track of their performance using the performance stats page.

[![Math Drills stats page](src/assets/images/readme/3.png?raw=true "Math Drills Stats 1")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/3.png)

Here users have access to a variety of stats that help keep track of their progress. All active user operations may be toggled and compared. Eventually this data will be displayed more competitively, with features like a leaderboard to help motivate users. 

[![Math Drills stats page 2](src/assets/images/readme/4.png?raw=true "Math Drills Stats 2")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/4.png)

Users can also keep track of their speed per operation.

[![Math Drills stats page 3](src/assets/images/readme/5.png?raw=true "Math Drills Stats 3")](https://github.com/FRTNX/math-drills/blob/master/src/assets/images/readme/5.png)

## What's next?
Some features are already in the pipeline to give more life to this web application:

* irc bridge - Since Math Drills users can't yet interact with each other I've decided to persue the social dimension by creating a bridge to liberachat's ##math channel. This will alllow users to interact with liberachat users as well as other Math Drills users, all without leaving the web app.

* leaderboard - We all enjoy being the best in the world at something. The incoming leaderboard feature will help cultivate a competitive spirit amongst users.

* math games - A set of unique math games users can play with each other.

* recommendation engine - An AI-powered recommendation engine that identifies the best set of drills for each user.

* syllabus-oriented drills - This will give users access to questions related to a specific syllabus and help them prepare for exams.

* classrooms - Drill rooms + observation streams/endpoints for educators.

## Contributions
Contributions are welcome. I've made the backend code very modular so that new operations can be added with minimal code and without need to update the frontend. That said, I have sinned and will soon repent: (sin #1) All the code is written in Node.js and eventually needs to be converted to TypeScript. I figured I'd build as much I can then write annotations later. As the codebase has grown I now see the error of my ways. (sin #2) For commissioned projects I'm always Mr. TDD. With side projects however... At  the time of writing the codebase is generally bug-free, having explored all features rigorously. Still, there are no tests. I'll be using the mocha-sinon-chai test suite for this task. Test coverage for all the code I've written is my responsibility so I won't be accepting any contributions there. However all new proposed features must be fully tested.

### Update: TypeScript conversion complete.

Developer contact: frtnx@protonmail.com
