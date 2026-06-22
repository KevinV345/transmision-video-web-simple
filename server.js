const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('soy_receptor', () => {
        socket.join('receptores');
        socket.to('emisores').emit('nuevo_receptor', socket.id);
    });

    socket.on('soy_emisor', () => {
        socket.join('emisores');
    });

    socket.on('webrtc_offer', (data) => {
        io.to(data.target).emit('webrtc_offer', { sdp: data.sdp, sender: socket.id });
    });

    socket.on('webrtc_answer', (data) => {
        io.to(data.target).emit('webrtc_answer', { sdp: data.sdp, sender: socket.id });
    });

    socket.on('webrtc_ice', (data) => {
        io.to(data.target).emit('webrtc_ice', { candidate: data.candidate, sender: socket.id });
    });

    socket.on('enviar_comando', (configuracion) => {
        socket.to('emisores').emit('aplicar_comando', configuracion);
    });

    socket.on('disconnect', () => {
        socket.to('emisores').emit('receptor_desconectado', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});