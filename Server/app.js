const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/DWT', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });


const taskSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

// Create the Task model
const deviceLocationSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});

// 创建设备位置模型
const DeviceLocation = mongoose.model('DeviceLocation', deviceLocationSchema);

// 设置 Express 中间件来解析 JSON 格式的请求体
app.use(express.json());
app.use(cors());
app.post('/api', async (req, res) => {
    const { id, record, location } = req.body;

    // 创建一个新的任务对象
    const newTask = new Task({
        id,
        value: record,
        location: {
            type: 'Point',
            coordinates: [location.coords.longitude, location.coords.latitude]
        }
    });

    try {
        // 将任务对象保存到数据库
        const savedTask = await newTask.save();
        console.log('Task saved successfully:', savedTask);

        // 发送成功响应给客户端
        res.status(200).json({ message: 'Task data received and saved successfully' });
    } catch (error) {
        console.error('Error saving task to MongoDB:', error);
        // 发送错误响应给客户端
        res.status(500).json({ error: 'Failed to save task data' });
    }
});
// 存储设备位置的端点
app.post('/api/device-location', async (req, res) => {
    const { deviceId, latitude, longitude, timestamp } = req.body;

    try {
        // 创建新的设备位置记录，即使已经存在具有相同 deviceId 的记录
        const newLocation = new DeviceLocation({ deviceId, latitude, longitude, timestamp });
        await newLocation.save();
        res.status(200).json({ message: 'Device location stored successfully' });
    } catch (error) {
        console.error('Error storing device location:', error);
        res.status(500).json({ error: 'Failed to store device location' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
