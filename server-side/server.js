import express from 'express'
import connect_mongodb from './model/connect_mongodb.js'
import MessageContent from './model/messages.js'
import mongoose from 'mongoose'
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import messages from './model/messages.js'


const app = express()

const httpServer = createServer(app);

const port = process.env.PORT || 3000

// connect_mongodb()

const users = new Map()

const rooms = new Map();

const privateRooms = new Map();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});


// io.on("connection", (socket) => {
//     socket.on('new-user-online', name => {
//         console.log('new-user.....', name)
//         users[socket.id] = name;
//         socket.broadcast.emit('user-online', name)
//     })

//     socket.on('send', message => {
//         const timestamp = new Date().toUTCString()
//         socket.broadcast.emit('receive', { message: message, name: users[socket.id], time: timestamp })
//     })

//     socket.on('disconnect', message => {
//         socket.broadcast.emit('left', users[socket.id])
//         delete users[socket.id]
//     })

// });

function generateRoomID() {
    const min = 10000;
    const max = 99999;
    const roomID = Math.floor(Math.random() * (max - min + 1)) + min;
    return roomID.toString();
}


io.on("connection", (socket) => {
    socket.on('new-user-online', name => {
        // console.log('new-user.....', name);
        users[socket.id] = name;
        socket.broadcast.emit('user-online', name);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        rooms.set(socket.id, roomId);
        socket.emit('roomJoined', roomId);
        socket.to(roomId).emit('userJoinedRoom', { roomId, userId: socket.id });
    });

    ///////////////// create new room ///////////////////
    socket.on('createRoomPrivate', (data) => {
        console.log(' data.userName', data.userName)
        console.log('data.recipientName', data.recipientName)
        const privateRoomID = generateRoomID(); // Generate a unique room ID
        const users = [data.userName, data.recipientName];

        // Store the room ID and users in the activeRooms map
        privateRooms?.set(privateRoomID, users);
        // Join the room
        privateRoomID && socket.join(privateRoomID);

        // Emit the roomID to both users
        socket.emit('createdRoomPrivate', { privateRoomID, sender: data.userName, recipient: data.recipientName });

        socket.to(privateRoomID).emit('joinedRoomPrivate', { privateRoomID, sender: data.userName, recipient: data.recipientName });
        console.log('privateRoomID', privateRoomID)
    });



    socket.on('send', message => {
        // console.log('users........', users);

        const roomId = rooms.get(socket.id);

        const timestamp = new Date().toUTCString();
        console.log('messageV1.......', message)
        const recipientName = message.recipientName;
        // console.log(users[recipientName])
        // console.log('recipientName on send......', recipientName)
        if (recipientName != undefined) {
            // console.log('recipientName found!')
            let recipientId = ''
            Object.entries(users).forEach(([key, value]) => {
                // console.log('Key:', key, 'Value:', value);
                if (value.includes(recipientName)) {
                    // console.log('recepientName matched...', recipientName)
                    recipientId = key
                    io.to(recipientId).emit('receive', { message, name: users[socket.id], time: timestamp, userId: message.recipientName, type: 'one-to-one' });

                }
                else {
                    // console.log('recepientName not matched...', recipientName)
                    // socket.to(roomId).emit('receive', { error: 'user is not register or login' });
                }
            });

        } else {
            // console.log('recipientName not found!')
            socket.to(roomId).emit('receive', { message, name: users[socket.id], time: timestamp });

        }

    });


    socket.on('disconnect', () => {
        const roomId = rooms.get(socket.id);
        // console.log('users[socket.id]', users[socket.id])
        // console.log('socket.id........', socket.id)
        // console.log('roomId......', roomId)
        if (roomId) {
            socket.to(roomId).emit('userLeftRoom', { name: users[socket.id], roomId, userId: socket.id });
            socket.leave(roomId);
            rooms.delete(socket.id);
        } else {
            // console.log()
        }
        delete users[socket.id];
    });
});










// const recipients = new Set();

// io.on('connection', (socket) => {
//   socket.on('joinRoom', (roomId) => {
//     socket.join(roomId);
//     recipients.add(socket.id); 
//     // ...
//   });

//   console.log('recipients.......', recipients)

//   socket.on('leaveRoom', (roomId) => {
//     socket.leave(roomId);
//     recipients.delete(socket.id); 
//     // ...
//   });

//   socket.on('send', (message) => {
//     const roomId = rooms.get(socket.id);
//     const timestamp = new Date().toUTCString();
//     const recipientName = message.recipientName;

//     if (recipientName && recipients.has(recipientName)) {
//       io.to(recipientName).emit('receive', {
//         message,
//         name: users[socket.id],
//         time: timestamp,
//         userId: recipientName,
//       });
//     } else {
//       socket.to(roomId).emit('receive', {
//         message,
//         name: users[socket.id],
//         time: timestamp,
//       });
//     }
//   });

//   socket.on('disconnect', () => {
//     const roomId = rooms.get(socket.id);
//     if (roomId) {
//       socket.to(roomId).emit('userLeftRoom', {
//         name: users[socket.id],
//         roomId,
//         userId: socket.id,
//       });
//       socket.leave(roomId);
//       rooms.delete(socket.id);
//       recipients.delete(socket.id); 
//     }
//     delete users[socket.id];

//   });
// });




app.get('/', (req, res) => {
    res.status(200).send('hello')
})



app.get('/api/v1/messages/sync', async (req, res) => {

    try {

        await MessageContent.find()
            .then((data) => {

                console.log('successfully message get!')

                res.status(200).send(data)
            })
            .catch((error) => {
                console.log('error getting messages!', error)
                res.status(500).send(error)
            })

    }
    catch (error) {
        console.log('error performing messages operation on server:', error)
    }


})



app.post('/api/v1/messages/new', async (req, res) => {
    const messagesGet = req.body

    console.log('messagesGet..............', messagesGet)



    try {

        await MessageContent.create(messagesGet)
            .then(() => {

                console.log('successfully message created!')

                res.status(200).send('successfully saved messages!')
            })
            .catch((error) => {

                console.log('error creating messages!', error)
                res.status(500).send(error)
            })



    }
    catch (error) {
        console.log('error performing messages operation on server:', error)
    }


})


httpServer.listen(port, () => {
    console.log(`server is listening on port ${port} ...`)
})