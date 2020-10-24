/**
 * Author: wudision0416
 * Date: 2020/10/22
 */

importClass(android.view.View);
// 获取并定义屏幕分辨率
const width = device.width;
const height = device.height;
const taskTableName = "赚喵币";
// 定义任务关键字列表
const browseTaskList = ["去浏览", "去逛逛", "去搜索"];    // 浏览类任务列表
const clickTaskList = ["领取奖励", "去完成"];            // 点击类任务列表
const taskBlackList = ["邀请好友", "组队", "淘宝特价版"];            // 子任务黑名单
const textQiandaoBtn = ["点击领取","点可领"];


// 设置全局变量
var isRuning = false,
    isClicking = false,
    showConsole = false,
    speed = 1;
    catHeight = 0;                          // 定义猫位置的高度系数,我太难了，手工测量，不知道准不准
    clickCatSpeed = 1000;                      //设置撸猫速度

// 设置坐标的自动缩放
setScreenMetrics(width, height);
//dialogs.alert("请确认无障碍和悬浮窗权限已开启，仅个人与好友使用，不承担意外传播任何后果，--- wudision0416");
// 确认悬浮窗权限
checkFloaty();
// 确认无障碍服务启动
auto.waitFor();
// 注册按键监听
registEvent();
//setSpeed();
//setClickSpeed();
// 打开活动页面
launch1111TaskMain();

// 启动悬浮窗
threads.start(function () {
    // 设置悬浮窗菜单
    var window = floaty.window(
        <vertical>
            <button id="start" margin="0" w="60">开始</button>
            <button id="stop" margin="0" w="60" visibility="gone">停止</button>
            <button id="clickCat" margin="0" w="60">逗猫</button>
            <button id="console" margin="0" w="60">调试</button>
            <button id="exit" margin="0" w="60">退出</button>
        </vertical>
    );

    // 设置悬浮窗位置
    window.setPosition(window.getX(), window.getY() + 200);

    // 当“开始”菜单被点击时
    window.start.click(function () {
        isRuning = true;
        isClicking = false;
        // 切换菜单
        ui.run(function () {
            window.start.setVisibility(View.GONE);
            window.stop.setVisibility(View.VISIBLE);
            window.clickCat.setVisibility(View.GONE);
        });
    });
    // 当“停止”菜单被点击时
    window.stop.click(function () {
        isRuning = false;
        isClicking = false;
        ui.run(function () {
            window.start.setVisibility(View.VISIBLE);
            window.clickCat.setVisibility(View.VISIBLE);
            window.stop.setVisibility(View.GONE);
        });
        threads.shutDownAll();
    });
    // 当“逗猫”菜单被点击时
    window.clickCat.click(function () {
        isClicking = true;
        isRuning = false;
        ui.run(function () {
            window.start.setVisibility(View.GONE);
            window.stop.setVisibility(View.VISIBLE);
            window.clickCat.setVisibility(View.GONE);
        });
    });
    // 当“调试”菜单被点击时
    window.console.click(function () {
        threads.start(function () {
            if (showConsole == false) {
                showConsole = true;
                console.show();
            } else {
                showConsole = false;
                console.hide();
                console.clear();
            }
        });
    });
    // 当“退出”菜单被点击时
    window.exit.click(function () {
        exit();
    });
});

while (true) {
    // 任务未开始执行
    if (isRuning) {
        // 设置操作速度
        if (speed === 0) {
            speed = 1;
        }
        openOrCloseTaskTable(true); // 进入任务列表页
        let taskDoneCnt = doingTask();
        if (taskDoneCnt == 0) {
           console.log("任务貌似已经做完了\n如未完成，请重点击【停止】新进入后再点击【开始】来运行");
           waitForDone(20000); 
        }
    } else if (isClicking) {
        // 设置操作速度
        if (speed == 0) {
            speed = 1;
        }
        openOrCloseTaskTable(false); // 回到活动主页
        // 获取 猫咪纵向位置
        if (catHeight == 0) {
            textQiandaoBtn.forEach(name => {
                console.log(name);
                // 找到主页签到按钮
                if(textContains(name).exists()) {
                    console.log(name+"存在");
                    let qianDaoBtn = textContains(name).findOne().bounds();
                    catHeight = qianDaoBtn.centerY();
                }
            })
        }
 
        if(clickCatSpeed == 0){
            clickCatSpeed = 1000;
        }
        click(width / 2, catHeight);
        waitForDone(clickCatSpeed); 
    } else {
        waitForDone(5000); //休息5秒判断
        continue;
    }
}

/**
 * 确认悬浮窗权限
 */
function checkFloaty() {
    if (!$floaty.checkPermission()) {
        // 没有悬浮窗权限，提示用户并跳转请求
        dialogs.alert("本脚本需要悬浮窗权限来显示悬浮窗，请在随后的界面中允许并重新运行本脚本。");
        $floaty.requestPermission();
        exit();
    } else {
        console.log("已有悬浮窗权限");
    }
}

/**
 * 打开双 11 活动页
 */
function launch1111TaskMain() {
    //打开活动页面
    console.log("正在打开淘宝");
    app.launch("com.taobao.taobao");
    waitForDone(1001);
    console.log("正在等待进入天猫双11喵喵喵活动页面\n如果没有反应请手动进入");
    className("android.view.View").desc("搜索").waitFor();
    let search = className("android.view.View").desc("搜索").depth(12).findOne().bounds()
    click(search.centerX(),search.centerY());
    waitForDone(500);
    id("searchEdit").findOne().setText("喵币");
    waitForDone(500);
    id("searchbtn").findOne().click()
    // 等待按键加载
    className("android.widget.Button").text(taskTableName).waitFor();
    waitForDone(1001);
}

/**
 * 进入任务列表页
 */
function enter1111TaskTable() {
    className("android.widget.Button").text(taskTableName).findOne().click();
    className("android.view.View").text("累计任务奖励").waitFor();
    waitForDone(1501);
}

/**
 * 定义延时函数,以ms为单位
 */
function waitForDone(timeUnit) {
    sleep(random(timeUnit, timeUnit + 50) * speed);
}

/**
 * 设置按键监听 当脚本执行时候按音量减 退出脚本
 */
function registEvent() {
    //启用按键监听
    events.observeKey();
    //监听音量上键按下
    events.onKeyDown("KEYCODE_VOLUME_DOWN", function (event) {
        toastLog("脚本手动退出");
        exit();
    });
}

/**
 * 定义操作速度
 */
function setSpeed() {
    while (true) {
        let choose = dialogs.select("请根据你的手机性能(卡不卡)以及网速选择速度,默认为1", "都挺好的,整个快速的 - 0.75", "一般吧,正常执行就好 - 1", "网速有点差,稍微慢点吧 - 1.25", "我手机很砖,整个最慢的吧 - 1.5");
        switch (choose) {
            case -1:
                toast("请选择");
                continue;
            case 0:
                toast("即将快速执行脚本");
                return 0.75;
            case 1:
                toast("即将一般速度执行脚本");
                return 1;
            case 2:
                toast("即将低速执行脚本");
                return 1.25;
            case 3:
                toast("即将缓慢执行脚本");
                return 1.5;
            default:
                return 1;
        }
    }
}

/**
 * 设定撸猫速度
 */
function setClickSpeed() {
    dialogs.build({
        title: "请输入撸猫间隔(单位：ms)，默认为1秒,与运行速度叠加",
        positive: "确定",
        negative: "取消",
        inputPrefill: "1000"
    }).on("input", (text, dialog)=>{
        clickCatSpeed = parseInt(text);
        console.log("你设定的间隔是" + clickCatSpeed + "ms。")
    }).show();
}

/** 
 * 执行任务列表页操作 
 */
function openOrCloseTaskTable(isActivate) {
    // 需要打开任务列表页
    if (isActivate) {
        // 如果时已在活动主页，未打开任务列表的状态，执行点击操作
        if (className("android.widget.Button").text(taskTableName).exists()) {
            enter1111TaskTable();
        } else if (className("android.view.View").text("累计任务奖励").exists()) {
            console.log("已在活动主页")
        } else {
            launch1111TaskMain();
            enter1111TaskTable();
        }
    } else {
        // 如果在活动任务主页，无需操作，否则重载
        if (className("android.widget.Button").text(taskTableName).exists()) {
            console.log("已在活动任务列表页")
        } else {
            launch1111TaskMain();
        }
    }
}

/**
 * 判断是否含有黑名单关键字
 */
function isInBlackList(title) {
    let flag_isIn = false;
    taskBlackList.forEach(tag => {
        if (title.indexOf(tag) != -1) {
            flag_isIn = true;
        }
    })
    return flag_isIn;
}

/**
 * 任务执行函数
 */
function doingTask() {
    let taskDoneCnt = 0;
    // 执行浏览类任务
    browseTaskList.forEach(task => {
        let taskCnt = 0;
        while (textContains(task).exists() && isRuning) {
            console.log("第" + (taskCnt + 1) + "个[" + task + "] 任务开始执行")
            let theSelector = text(task).findOnce();
            // 等待页面加载
            waitForDone(501);
            theSelector.click();
            waitForDone(1501);
            swipe(width / 2, height - 500, width / 2, 0, random(801, 818) * speed);
            waitForDone(2501);
            swipe(width / 2, height - 500, width / 2, 0, random(801, 818) * speed);
            waitForDone(8001);
            swipe(width / 2, height - 500, width / 2, 0, random(801, 818) * speed);
            textContains("完成").findOne(random(10001, 10018) * speed);
            console.log("--------\n第" + (taskCnt + 1) + "个[" + task + "] 任务结束");
            taskCnt++;
            waitForDone(601);
            back();
            // 等待
            taskDoneCnt++;
            waitForDone(2001);
        }
    })
    // 执行点击类任务
    clickTaskList.forEach(task => {
        let taskCollection = className("android.widget.Button").text(task).find();
        taskCollection.forEach(childTask => {
            let title = childTask.parent().child(0).child(0).text();
            console.log(title);
            if (!isInBlackList(title)) {
                console.log("找到[" + task + "]任务");
                textContains(task).findOne().click();
                console.log("--------\n[" + task + "]任务完成");
                taskDoneCnt++;
            } else {
                console.log("跳过[" + task + "]任务");
            }
        })
    })
    return taskDoneCnt;
}