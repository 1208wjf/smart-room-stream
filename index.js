// Vercel Edge Function 后端服务
import { NextResponse } from 'next/server';

// 模拟数据库
const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    role: 'user'
  }
];

const rooms = [
  {
    id: 1,
    name: '1号自习室',
    capacity: 30,
    currentOccupancy: 15,
    status: '正常'
  },
  {
    id: 2,
    name: '2号自习室',
    capacity: 40,
    currentOccupancy: 20,
    status: '正常'
  },
  {
    id: 3,
    name: '3号自习室',
    capacity: 25,
    currentOccupancy: 10,
    status: '正常'
  }
];

const seats = [
  {
    id: 1,
    roomId: 1,
    seatNumber: '1排1座',
    status: 0, // 0: 空闲, 1: 占用, 2: 预约
    zone: 'A区'
  },
  {
    id: 2,
    roomId: 1,
    seatNumber: '1排2座',
    status: 1,
    zone: 'A区'
  },
  {
    id: 3,
    roomId: 1,
    seatNumber: '2排1座',
    status: 0,
    zone: 'B区'
  },
  {
    id: 4,
    roomId: 2,
    seatNumber: '1排1座',
    status: 0,
    zone: 'A区'
  },
  {
    id: 5,
    roomId: 2,
    seatNumber: '1排2座',
    status: 1,
    zone: 'A区'
  }
];

const lockers = [
  {
    id: 1,
    number: '1号储物柜',
    status: 0, // 0: 空闲, 1: 使用中
    userId: null
  },
  {
    id: 2,
    number: '2号储物柜',
    status: 1,
    userId: 1
  },
  {
    id: 3,
    number: '3号储物柜',
    status: 0,
    userId: null
  }
];

const feedbacks = [
  {
    id: 1,
    userId: 2,
    content: '自习室环境很好，希望能增加更多座位',
    status: '待处理',
    createTime: new Date().toISOString()
  },
  {
    id: 2,
    userId: 1,
    content: '建议增加空调温度控制',
    status: '已处理',
    createTime: new Date().toISOString()
  }
];

const settings = {
  id: 1,
  maxReservationTime: 4,
  cleaningTime: '22:00',
  openingHours: '08:00',
  closingHours: '22:00'
};

// 处理登录请求
async function handleLogin(req) {
  try {
    const body = await req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json(
        { code: 400, message: '用户名和密码不能为空', data: null },
        { status: 400 }
      );
    }
    
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { code: 401, message: '用户名或密码错误', data: null },
        { status: 401 }
      );
    }
    
    // 生成简单的token
    const token = 'token-' + username + '-' + Date.now();
    
    return NextResponse.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '服务器内部错误', data: null },
      { status: 500 }
    );
  }
}

// 处理获取房间列表请求
function handleGetRooms() {
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: rooms
  });
}

// 处理获取座位列表请求
function handleGetSeats(roomId) {
  const roomSeats = seats.filter(seat => seat.roomId === parseInt(roomId));
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: roomSeats
  });
}

// 处理预约座位请求
async function handleBookSeat(req) {
  try {
    const body = await req.json();
    const { seatId, startTime, endTime } = body;
    
    if (!seatId || !startTime || !endTime) {
      return NextResponse.json(
        { code: 400, message: '缺少必要参数', data: null },
        { status: 400 }
      );
    }
    
    const seat = seats.find(s => s.id === parseInt(seatId));
    
    if (!seat) {
      return NextResponse.json(
        { code: 404, message: '座位不存在', data: null },
        { status: 404 }
      );
    }
    
    if (seat.status === 1) {
      return NextResponse.json(
        { code: 400, message: '座位已被占用', data: null },
        { status: 400 }
      );
    }
    
    seat.status = 2; // 预约状态
    return NextResponse.json({
      code: 200,
      message: '预约成功',
      data: seat
    });
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '服务器内部错误', data: null },
      { status: 500 }
    );
  }
}

// 处理获取储物柜列表请求
function handleGetLockers() {
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: lockers
  });
}

// 处理更新储物柜状态请求
async function handleUpdateLockerStatus(req, id) {
  try {
    const body = await req.json();
    const { status } = body;
    const locker = lockers.find(l => l.id === parseInt(id));
    
    if (!locker) {
      return NextResponse.json(
        { code: 404, message: '储物柜不存在', data: null },
        { status: 404 }
      );
    }
    
    locker.status = status;
    return NextResponse.json({
      code: 200,
      message: '更新成功',
      data: locker
    });
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '服务器内部错误', data: null },
      { status: 500 }
    );
  }
}

// 处理获取设置请求
function handleGetSettings() {
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: settings
  });
}

// 处理获取反馈列表请求
function handleGetFeedbackList() {
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: feedbacks
  });
}

// 处理提交反馈请求
async function handleSubmitFeedback(req) {
  try {
    const body = await req.json();
    const { content, userId } = body;
    
    if (!content) {
      return NextResponse.json(
        { code: 400, message: '反馈内容不能为空', data: null },
        { status: 400 }
      );
    }
    
    const newFeedback = {
      id: feedbacks.length + 1,
      userId: userId || 2,
      content,
      status: '待处理',
      createTime: new Date().toISOString()
    };
    
    feedbacks.push(newFeedback);
    return NextResponse.json({
      code: 200,
      message: '提交成功',
      data: newFeedback
    });
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '服务器内部错误', data: null },
      { status: 500 }
    );
  }
}

// 处理更新反馈状态请求
async function handleUpdateFeedbackStatus(req, id) {
  try {
    const body = await req.json();
    const { status } = body;
    const feedback = feedbacks.find(f => f.id === parseInt(id));
    
    if (!feedback) {
      return NextResponse.json(
        { code: 404, message: '反馈不存在', data: null },
        { status: 404 }
      );
    }
    
    feedback.status = status;
    return NextResponse.json({
      code: 200,
      message: '更新成功',
      data: feedback
    });
  } catch (error) {
    return NextResponse.json(
      { code: 500, message: '服务器内部错误', data: null },
      { status: 500 }
    );
  }
}

// 处理删除反馈请求
function handleDeleteFeedback(id) {
  const index = feedbacks.findIndex(f => f.id === parseInt(id));
  
  if (index === -1) {
    return NextResponse.json(
      { code: 404, message: '反馈不存在', data: null },
      { status: 404 }
    );
  }
  
  feedbacks.splice(index, 1);
  return NextResponse.json({
    code: 200,
    message: '删除成功',
    data: null
  });
}

// 处理获取AI监控数据请求
function handleGetMonitorData() {
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: rooms
  });
}

// 处理获取使用趋势请求
function handleGetUsageTrends() {
  const usageData = [
    { date: '10-01', count: 85 },
    { date: '10-02', count: 92 },
    { date: '10-03', count: 78 },
    { date: '10-04', count: 105 },
    { date: '10-05', count: 120 },
    { date: '10-06', count: 115 },
    { date: '10-07', count: 98 }
  ];
  
  return NextResponse.json({
    code: 200,
    message: '获取数据成功',
    data: usageData
  });
}

// 主处理函数
export async function GET(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // 处理CORS
  if (path === '/api/cors') {
    return NextResponse.json({ code: 200, message: 'OK' });
  }
  
  // 处理获取房间列表请求
  if (path === '/api/rooms') {
    return handleGetRooms();
  }
  
  // 处理获取座位列表请求
  const seatsMatch = path.match(/^\/api\/seats\/(\d+)$/);
  if (seatsMatch) {
    return handleGetSeats(seatsMatch[1]);
  }
  
  // 处理获取储物柜列表请求
  if (path === '/api/lockers') {
    return handleGetLockers();
  }
  
  // 处理获取设置请求
  if (path === '/api/settings') {
    return handleGetSettings();
  }
  
  // 处理获取反馈列表请求
  if (path === '/api/feedback') {
    return handleGetFeedbackList();
  }
  
  // 处理获取AI监控数据请求
  if (path === '/api/ai/monitor') {
    return handleGetMonitorData();
  }
  
  // 处理获取使用趋势请求
  if (path === '/api/ai/usage-trends') {
    return handleGetUsageTrends();
  }
  
  // 处理其他请求
  return NextResponse.json(
    { code: 404, message: '接口不存在', data: null },
    { status: 404 }
  );
}

export async function POST(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // 处理登录请求
  if (path === '/api/login') {
    return handleLogin(req);
  }
  
  // 处理预约座位请求
  if (path === '/api/seats/book') {
    return handleBookSeat(req);
  }
  
  // 处理提交反馈请求
  if (path === '/api/feedback') {
    return handleSubmitFeedback(req);
  }
  
  // 处理其他请求
  return NextResponse.json(
    { code: 404, message: '接口不存在', data: null },
    { status: 404 }
  );
}

export async function PUT(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // 处理更新储物柜状态请求
  const lockerMatch = path.match(/^\/api\/lockers\/(\d+)$/);
  if (lockerMatch) {
    return handleUpdateLockerStatus(req, lockerMatch[1]);
  }
  
  // 处理更新反馈状态请求
  const feedbackMatch = path.match(/^\/api\/feedback\/(\d+)$/);
  if (feedbackMatch) {
    return handleUpdateFeedbackStatus(req, feedbackMatch[1]);
  }
  
  // 处理其他请求
  return NextResponse.json(
    { code: 404, message: '接口不存在', data: null },
    { status: 404 }
  );
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // 处理删除反馈请求
  const feedbackMatch = path.match(/^\/api\/feedback\/(\d+)$/);
  if (feedbackMatch) {
    return handleDeleteFeedback(feedbackMatch[1]);
  }
  
  // 处理其他请求
  return NextResponse.json(
    { code: 404, message: '接口不存在', data: null },
    { status: 404 }
  );
}

export async function OPTIONS() {
  return NextResponse.json({ code: 200, message: 'OK' });
}
