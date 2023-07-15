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


function findExistingPrivateRoom(userName, recipientName) {
    for (const [roomID, users] of privateRooms) {
        if (users.includes(userName) && users.includes(recipientName)) {
            return roomID;
        }
    }
    return null;
}

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
        // console.log('users[socket.id]', users[socket.id])
        // console.log('users.........', users)
        socket.broadcast.emit('user-online', name);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        rooms.set(socket.id, roomId);
        socket.emit('roomJoined', roomId);
        console.log('roomID.....', roomId)
        socket.to(roomId).emit('userJoinedRoom', { roomId, userId: socket.id });
    });

    ///////////////// create new room ///////////////////
    // socket.on('createRoomPrivate', (data) => {
    //     const { userName, recipientName } = data;

    //     // Check if the user is already in a private room with the recipient
    //     const existingRoom = findExistingPrivateRoom(userName, recipientName);
    //     if (existingRoom) {
    //       // Skip room creation if a room already exists
    //       socket.emit('createdRoomPrivate', { privateRoomID: existingRoom, sender: userName, recipient: recipientName });
    //       return;
    //     }

    //     const privateRoomID = generateRoomID();
    //     const users = [userName, recipientName];
    //     privateRooms.set(privateRoomID, users);


    //     socket.join(privateRoomID);
    //     socket.emit('createdRoomPrivate', { privateRoomID, sender: userName, recipient: recipientName });
    //     socket.to(recipientName).emit('joinedRoomPrivate', { privateRoomID, sender: userName, recipient: recipientName });              

    //   });

    // ...

    socket.on('createRoomPrivate', (data) => {
        const { userName, recipientName } = data;
        // Check if the user is already in a private room with the recipient
        const existingRoom = findExistingPrivateRoom(userName, recipientName);
        if (existingRoom) {
            // Skip room creation if a room already exists
            socket.emit('createdRoomPrivate', { privateRoomID: existingRoom, sender: userName, recipient: recipientName });
            return;
        }

        const privateRoomID = generateRoomID();
        const PrivateUsers = [userName, recipientName];
        privateRooms.set(privateRoomID, PrivateUsers);

        socket.join(privateRoomID);
        socket.emit('createdRoomPrivate', { privateRoomID, sender: userName, recipient: recipientName });




        // console.log('users......', users)
        console.log('above hitttttttttt');
        Object.entries(users).forEach(([key, value]) => {
            // console.log('Key:', key, 'Value:', value);
            // console.log('recipientName', recipientName)
            if (value.includes(recipientName)) {
                console.log('recepientName matched...', recipientName)

                console.log('recipientId', key)
                io.to(key).emit('joinedRoomPrivate', { privateRoomID, sender: userName, recipient: recipientName });
                console.log('hitttttttttttttttttttt')
                console.log('Key if:', key, 'Value:', value);
                console.log({ privateRoomID, sender: userName, recipient: recipientName })
            }

        });
    });

    // ...




    socket.on('send', message => {
        console.log('message........', message);

        const roomId = rooms.get(socket.id);
        // console.log('roomId.......', roomId)

        const timestamp = new Date().toUTCString();
        // console.log('messageV1.......', message)
        const recipientName = message.recipientName;
        // console.log(users[recipientName])
        // console.log('recipientName on send......', recipientName)
        if (recipientName != undefined) {
            // console.log('recipientName found!')
            let recipientId = ''
            // console.log('users from send......', users)

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




// let recipientId = ''
// console.log('privateRoomID....', privateRoomID)
// console.log('privateRooms....', privateRooms)
//     Object.entries(privateRooms).forEach(([key, value]) => {
//         // console.log('Key:', key, 'Value:', value);
//         if (value.includes(privateRoomID)) {
//             console.log('recepientName matched...', recipientName)
//             recipientId = key
//             socket.to(recipientId).emit('joinedRoomPrivate', { privateRoomID, sender: userName, recipient: recipientName });

//         }
//         else {
//             console.log('recepientName not matched...', recipientName)
//             // socket.to(roomId).emit('receive', { error: 'user is not register or login' });
//         }
//     });

////////////////////////////////////////////////////////////////////////////////

// for (const [id, names] of privateRooms.entries()) {
//     if (id === privateRoomID) {
//       console.log('Match found!');
//       console.log('ID:', id);
//       console.log('Names:', names);

//       socket.to(id[recipientName]).emit('joinedRoomPrivate', { privateRoomID, sender: userName, recipient: recipientName });              
//       console.log({ privateRoomID, sender: userName, recipient: recipientName })

//       break; // Exit the loop if a match is found

//     }
//   }








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