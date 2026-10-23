
import { Server, Socket } from "socket.io";

const socketHandler = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinCourse", (courseId: string | number) => {
      const id = String(courseId ?? "").trim();

      if (!/^\d+$/.test(id) || Number(id) < 1) {
        socket.emit("errorMessage", {
          message: "Valid course ID is required"
        });
        return;
      }

      const room = `course_${id}`;

      socket.join(room);

      socket.emit("joinedCourse", {
        courseId: id,
        room
      });

      socket.to(room).emit("userJoined", {
        socketId: socket.id,
        courseId: id
      });

      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("leaveCourse", (courseId: string | number) => {
      const id = String(courseId ?? "").trim();

      if (!/^\d+$/.test(id) || Number(id) < 1) {
        return;
      }

      socket.leave(`course_${id}`);

      socket.emit("leftCourse", {
        courseId: id
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
