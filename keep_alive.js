const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// المرجع الداخلي للإعدادات والحالة
let botState = {
    isRunning: true,
    isChatActive: true,
    isVoiceActive: true,
    isTaskRunning: true,
    isPlanBRunning: false,
    stats: {},
    config: {}
};

// دالة لتلقي البيانات وتحديثها من index.js
const updateBotState = (data) => {
    botState = { ...botState, ...data };
};

app.get('/', (req, res) => {
    const c = botState.config || {};
    const s = botState.stats || {};
    const t = botState.taskStates || {};
    const taskActive = taskName => botState.isRunning && botState.isChatActive && botState.isTaskRunning && t[taskName];
    const planBActive = botState.isPlanBRunning;
    const defaultTargetId = '998040612047691827';
    const targetIds = Array.from(new Set([
        ...(Array.isArray(c.task4TargetIds) ? c.task4TargetIds : []),
        c.task4TargetId || defaultTargetId
    ].filter(id => /^\d+$/.test(String(id || '').trim()))));
    const primaryTargetId = targetIds.includes(c.task4TargetId) ? c.task4TargetId : targetIds[0] || defaultTargetId;
    const targetRows = targetIds.map(id =>
        '<div class="target-chip ' + (id === primaryTargetId ? 'is-primary' : '') + '" data-target-id="' + id + '">' +
            '<span class="target-id">' + id + '</span>' +
            '<span class="primary-label">' + (id === primaryTargetId ? 'أساسي' : '') + '</span>' +
            '<button type="button" data-target-action="primary">' + (id === primaryTargetId ? 'الأساسي' : 'جعله أساسيًا') + '</button>' +
            '<button type="button" data-target-action="remove">حذف</button>' +
        '</div>'
    ).join('');
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🎮 لوحة التحكم النيون | Discord Selfbot</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Orbitron:wght@400;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes pulseAnim {
                    0% { background-color: rgba(255, 255, 255, 0.03); }
                    50% { background-color: rgba(255, 255, 255, 0.12); }
                    100% { background-color: rgba(255, 255, 255, 0.03); }
                }

                @keyframes aichatDot {
                    0%, 60%, 100% { opacity: 0.4; }
                    30% { opacity: 1; }
                }

                .pulse-anim {
                    animation: pulseAnim 0.5s ease-out;
                }

:root {

--bg-deep: #0C0D15; /* خلفية أعمق */
                    --bg-base: #151720; /* خلفية أساسية */
                    --bg-surface: #1E212B; /* سطح العناصر */
                    --bg-card: #282C3A; /* خلفية الكروت */
                    --bg-card-hover: #34394A; /* خلفية الكروت عند التحويم */
                    --bg-elevated: #3C4253; /* خلفية العناصر المرتفعة */
                    --line-soft: rgba(255, 255, 255, 0.05); /* خطوط ناعمة */
                    --line: rgba(255, 255, 255, 0.08); /* خطوط متوسطة */
                    --line-strong: rgba(255, 255, 255, 0.12); /* خطوط قوية */
                    --text-bright: #E0E6F0; /* نص ساطع */
                    --text-main: #C8D1DE; /* نص رئيسي */
                    --text-soft: #9AA8BA; /* نص ناعم */

--text-sub: #7A899C; /* نص فرعي */

--neon-rgb: 135, 206, 250; /* سماء زرقاء نيون */
                    --neon: #87CEFA; /* لون النيون */
                    --neon-bright: #ADD8E6; /* نيون ساطع */
                    --neon-dim: rgba(135, 206, 250, 0.15); /* نيون خافت */
                    --neon-glow: rgba(135, 206, 250, 0.3); /* توهج نيون */

--neon-glow-strong: rgba(135, 206, 250, 0.5); /* توهج نيون قوي */

--accent: #6A9CFF; /* لون التمييز (أزرق فاتح) */
                    --accent-dim: rgba(106, 156, 255, 0.15); /* تمييز خافت */

--accent-soft: rgba(106, 156, 255, 0.3); /* تمييز ناعم */

--success: #6EE7B7; /* نجاح (أخضر زمردي) */
                    --success-dim: rgba(110, 231, 183, 0.12);
                    --danger: #FF7B8A; /* خطر (أحمر مرجاني) */
                    --danger-dim: rgba(255, 123, 138, 0.12);

                    --shadow-light: rgba(0, 0, 0, 0.1);
                    --shadow-medium: rgba(0, 0, 0, 0.25);
                    --shadow-strong: rgba(0, 0, 0, 0.4);
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Tajawal', 'Cairo', sans-serif;
                }

                body {
                    --account-accent: var(--neon);
                    --account-accent-soft: var(--neon-dim);
                    background-color: var(--bg-deep);
                    color: var(--text-main);
                    min-height: 100vh;

                    padding: 40px 24px 80px; /* زيادة الهوامش لتوفير مساحة */
                    overflow-x: hidden;
                    position: relative;
                    letter-spacing: 0.2px;
                }

                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;

right: 0;

height: 2px; /* خط علوي أسمك */
                    background: linear-gradient(90deg, transparent, var(--neon-bright) 50%, transparent);
                    z-index: 100;

                    box-shadow: 0 0 15px var(--neon-glow-strong); /* توهج أقوى */
                }

                .container {

                    max-width: 1320px; /* عرض أقصى أكبر */
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }

                header {

text-align: right;

margin-bottom: 40px; /* مسافة أكبر */
                    padding: 32px 40px; /* بادينغ أكبر */
                    border: 1px solid var(--line-strong); /* حدود أقوى */
                    background: linear-gradient(145deg, var(--bg-surface), var(--bg-base)); /* تدرج خلفية */
                    box-shadow: 0 8px 25px var(--shadow-strong); /* ظلال أعمق */
                    border-radius: 12px; /* زوايا مستديرة */

position: relative;

overflow: hidden;

}

header::before {
                    content: '';

position: absolute;

top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at 100% 0%, rgba(var(--neon-rgb), 0.08) 0%, transparent 70%);
                    opacity: 0.6;
                    pointer-events: none;

}

header h1 {
                    font-size: 2.5rem; /* حجم خط أكبر */
                    font-weight: 900;

font-family: 'Orbitron', monospace;

letter-spacing: 3px;

color: var(--text-bright);

margin-bottom: 12px; /* مسافة أكبر */
                    text-shadow: 0 0 10px rgba(var(--neon-rgb), 0.4); /* ظلال نص نيون */

}

header p {
                    color: var(--text-soft);
                    font-size: 1rem; /* حجم خط أكبر */
                    font-weight: 400;
                    letter-spacing: 0.7px;

}

.status-line {
                    display: flex;
                    justify-content: flex-start;
                    gap: 16px; /* مسافة أكبر */
                    margin-top: 28px; /* مسافة أكبر */

flex-wrap: wrap;

}

.status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 18px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    border-radius: 8px; /* زوايا مستديرة */
                    background: var(--bg-surface); /* خلفية العنصر */
                    backdrop-filter: blur(10px); /* فلتر ضبابي أقوى */
                    -webkit-backdrop-filter: blur(10px);
                    font-weight: 600;
                    font-size: 0.9rem; /* حجم خط أكبر */
                    transition: all 0.3s ease-out;
                    box-shadow: 0 2px 8px var(--shadow-medium); /* ظلال للعناصر */
                }

                .status-indicator:hover {
                    border-color: var(--neon-dim); /* حدود نيون عند التحويم */
                    background: var(--bg-card-hover);
                    transform: translateY(-2px); /* تأثير رفع بسيط */
                    box-shadow: 0 6px 16px var(--shadow-strong);

}

.status-dot {
                    width: 9px; /* حجم أكبر */
                    height: 9px;
                    border-radius: 50%;
                    box-shadow: 0 0 10px currentColor; /* توهج أكبر */
                }

                .status-dot.active { background: var(--success); color: var(--success); }
                .status-dot.inactive { background: var(--danger); color: var(--danger); }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); /* كروت أكبر */
                    gap: 25px; /* مسافة أكبر بين الكروت */
                    margin-bottom: 35px; /* مسافة أكبر */

}

.dashboard-nav {
                    display: flex;
                    gap: 8px; /* مسافة أكبر */
                    padding: 8px; /* بادينغ أكبر */
                    margin-bottom: 40px; /* مسافة أكبر */
                    border: 1px solid var(--line-strong);
                    background: linear-gradient(180deg, var(--bg-surface), var(--bg-base));
                    backdrop-filter: blur(20px); /* فلتر ضبابي أقوى */
                    -webkit-backdrop-filter: blur(20px);
                    overflow-x: auto;
                    box-shadow:
                        0 12px 35px var(--shadow-strong),
                        inset 0 1px 0 rgba(255, 255, 255, 0.06),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.35);
                    border-radius: 15px; /* زوايا مستديرة أكبر */
                    position: relative;

}

.dashboard-nav::before {
                    content: '';
                    position: absolute;
                    top: -1px;
                    left: 5%;
                    right: 5%;
                    height: 2px; /* خط علوي أسمك */
                    background: linear-gradient(90deg, transparent, var(--neon-bright), transparent);
                    opacity: 0.7;
                    box-shadow: 0 0 8px var(--neon-glow);

}

.dashboard-nav button {
                    flex: 1;
                    min-width: 180px; /* عرض أصغر للأزرار */
                    padding: 16px 25px; /* بادينغ أكبر */
                    border: 1px solid transparent;
                    border-radius: 10px; /* زوايا مستديرة أكبر */
                    background: transparent;

color: var(--text-sub);

cursor: pointer;
                    font: inherit;
                    font-weight: 700;
                    font-size: 0.95rem; /* حجم خط أكبر */
                    white-space: nowrap;
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                    letter-spacing: 0.4px;

}

.dashboard-nav button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: radial-gradient(circle, rgba(var(--neon-rgb), 0.1), transparent 70%);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: width 0.6s ease, height 0.6s ease;
                    pointer-events: none;
                    opacity: 0;

}

.dashboard-nav button:hover {
                    color: var(--text-bright);
                    background: rgba(var(--neon-rgb), 0.03); /* خلفية خفيفة عند التحويم */
                    border-color: rgba(var(--neon-rgb), 0.1);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .dashboard-nav button:hover::before {
                    width: 220px;
                    height: 220px;

opacity: 1;

}

                .dashboard-nav button.active {
                    color: var(--neon-bright);
                    background: linear-gradient(135deg, rgba(var(--neon-rgb), 0.15), rgba(var(--neon-rgb), 0.05));
                    border-color: rgba(var(--neon-rgb), 0.3);
                    box-shadow:
                        0 8px 25px rgba(var(--neon-rgb), 0.2),
                        inset 0 1px 0 rgba(var(--neon-rgb), 0.1),
                        inset 0 0 0 1px rgba(var(--neon-rgb), 0.08);

}

.dashboard-nav button.active::after {
                    content: '';
                    position: absolute;
                    bottom: 6px; /* خط سفلي أعلى قليلاً */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40%; /* خط أوسع */
                    height: 3px; /* خط أسمك */
                    background: var(--neon-bright);
                    border-radius: 3px;
                    box-shadow: 0 0 10px var(--neon-glow-strong);

}

.dashboard-panel {
                    display: none;

}

.dashboard-panel.active {
                    display: grid;
                }

                .task-manager,
                .timing-manager {
                    min-height: 100%;
                }

                .task-list {
                    display: grid;
                    gap: 12px; /* مسافة أكبر */

}

.task-row {

display: flex;

align-items: center;
                    justify-content: space-between;
                    gap: 16px; /* مسافة أكبر */
                    padding: 16px 20px; /* بادينغ أكبر */

border: 1px solid var(--line);

border-right: 4px solid var(--neon); /* حدود يمين بلون النيون */
                    background: var(--bg-card);
                    border-radius: 8px; /* زوايا مستديرة */
                    transition: all 0.3s ease-out;
                    box-shadow: 0 2px 10px var(--shadow-light);

}

.task-row:hover {
                    background: var(--bg-card-hover);
                    border-color: var(--line-strong);
                    border-right-color: var(--neon-bright); /* لون نيون أسطع عند التحويم */
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px var(--shadow-medium);

}

.task-name {
                    display: flex;
                    align-items: center;
                    gap: 14px; /* مسافة أكبر */
                    min-width: 0;
                    color: var(--text-bright);
                    font-weight: 700;
                    font-size: 1.05rem; /* حجم خط أكبر */

}

.task-number {
                    display: grid;
                    place-items: center;
                    width: 36px; /* حجم أكبر */
                    height: 36px;
                    flex: 0 0 36px;
                    border: 1px solid var(--neon-dim); /* حدود نيون */
                    background: var(--neon-dim);
                    color: var(--neon-bright);
                    font-size: 0.85rem; /* حجم خط أكبر */
                    font-weight: 800;
                    border-radius: 8px; /* زوايا مستديرة */
                    box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.2);

}

.task-state {
                    margin-right: auto;
                    color: var(--text-sub);
                    font-size: 0.85rem; /* حجم خط أكبر */
                    white-space: nowrap;
                    font-weight: 500;
                    letter-spacing: 0.2px;

}

.task-row .btn {
                    flex: 0 0 auto;
                    min-width: 120px; /* عرض أكبر للأزرار */
                    padding: 10px 16px; /* بادينغ أكبر */
                    border-radius: 8px;
                    font-size: 0.9rem;
                }

                .timing-manager form {
                    gap: 14px; /* مسافة أكبر */
                }

                .planb-card {
                    border: 1px solid var(--accent-soft);
                    background: linear-gradient(135deg, var(--bg-card), var(--bg-surface)); /* تدرج خلفية */
                    box-shadow: 0 4px 15px var(--shadow-medium);
                }

                .planb-card h3 {
                    color: var(--neon);
                    border-bottom-color: var(--line-strong);
                }

                .planb-card .task-row {
                    border-color: var(--line);
                    border-right-color: var(--accent); /* حدود بلون التمييز */
                }

                .timing-group {
                    padding: 16px 20px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    background: var(--bg-surface);
                    border-radius: 10px; /* زوايا مستديرة أكبر */
                    transition: all 0.3s ease-out;
                    box-shadow: 0 2px 8px var(--shadow-light);
                }

                .timing-group:hover {
                    border-color: var(--neon-dim);
                    background: var(--bg-card-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px var(--shadow-medium);
                }

                .timing-group label {
                    display: block;
                    margin-bottom: 12px; /* مسافة أكبر */
                    color: var(--text-bright);
                    font-size: 0.9rem; /* حجم خط أكبر */
                    font-weight: 600;
                }

                .timing-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px; /* مسافة أكبر */
                }

                .timing-fields input {
                    min-width: 0;
                }
                .target-list {
                    display: grid;
                    gap: 10px; /* مسافة أكبر */
                    margin-top: 16px; /* مسافة أكبر */
                    padding: 12px; /* بادينغ أكبر */
                    min-height: 70px; /* ارتفاع أدنى أكبر */
                    border: 1px solid var(--line-strong);
                    background: var(--bg-base); /* خلفية أعمق */
                    border-radius: 10px;
                    box-shadow: inset 0 1px 3px var(--shadow-light);
                }

                .target-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px; /* مسافة أكبر */
                    margin-bottom: 20px; /* مسافة أكبر */
                    padding-bottom: 18px; /* بادينغ أكبر */
                    border-bottom: 1px solid var(--line);
                }

                .target-title h3 {
                    margin-bottom: 6px; /* مسافة أكبر */
                    border-bottom: 0;
                    padding-bottom: 0;
                    color: var(--neon-bright); /* لون نيون ساطع */
                }

                .target-title p {
                    color: var(--text-sub);
                    font-size: 0.8rem; /* حجم خط أكبر */
                }

                .target-count {
                    padding: 8px 14px; /* بادينغ أكبر */
                    border: 1px solid var(--accent-soft);
                    background: var(--accent-dim);
                    color: var(--neon);
                    font-size: 0.8rem;
                    font-weight: 700;
                    white-space: nowrap;
                    border-radius: 6px;
                }

                .target-add {
                    display: flex;
                    align-items: stretch;
                    gap: 12px; /* مسافة أكبر */
                }

                .target-add input {
                    flex: 1;
                }

                .target-add .btn {
                    flex: 0 0 auto;
                    min-width: 140px; /* عرض أكبر */
                }

                .target-mode {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px; /* مسافة أكبر */
                    margin-top: 18px; /* مسافة أكبر */
                    padding: 16px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    background: var(--bg-surface);
                    border-radius: 10px;
                    box-shadow: 0 2px 8px var(--shadow-light);
                }

                .target-mode select {
                    width: min(60%, 280px); /* عرض أكبر */
                }

                .target-save {
                    width: 100%;
                    margin-top: 20px; /* مسافة أكبر */
                }

                .target-chip {
                    display: flex;
                    align-items: center;
                    gap: 12px; /* مسافة أكبر */
                    padding: 13px 16px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    border-right: 3px solid var(--line-strong);
                    background: var(--bg-card);
                    color: var(--text-bright);
                    font-size: 0.9rem; /* حجم خط أكبر */
                    border-radius: 8px;
                    transition: all 0.3s ease-out;
                    box-shadow: 0 1px 6px var(--shadow-light);
                }

                .target-chip:hover {
                    background: var(--bg-card-hover);
                    border-right-color: var(--neon-bright);
                    box-shadow: 0 3px 10px var(--shadow-medium);
                }

                .target-chip.is-primary {
                    border-color: var(--accent-soft);
                    border-right-color: var(--neon-bright);
                    background: linear-gradient(90deg, var(--accent-dim) 0%, var(--bg-card) 100%); /* تدرج خلفية */
                    box-shadow: 0 4px 12px rgba(var(--neon-rgb), 0.2);
                }

                .target-manager.random-mode .target-chip.is-primary {
                    border-color: var(--line-strong);
                    border-right-color: var(--line-strong);
                    background: var(--bg-card-hover);
                    box-shadow: none;
                }

                .target-manager.random-mode .primary-label {
                    color: var(--text-sub);
                }

                .target-chip .target-id {
                    margin-right: auto;
                    font-weight: 600;
                    color: var(--text-bright);
                }

                .target-chip .primary-label {
                    color: var(--neon);
                    font-size: 0.8rem; /* حجم خط أكبر */
                    font-weight: 700;
                }

                .target-chip button {
                    border: 1px solid var(--line-strong);
                    background: rgba(0, 0, 0, 0.4);
                    color: var(--text-soft);
                    cursor: pointer;
                    padding: 7px 12px; /* بادينغ أكبر */
                    font: inherit;
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 5px;
                    transition: all 0.2s ease;
                }

                .target-chip button:hover {
                    color: var(--neon-bright);
                    border-color: var(--neon-dim);
                    background: rgba(var(--neon-rgb), 0.1);
                }

                .monitor-channel-item {
                    padding: 14px 16px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    border-right: 4px solid var(--line-strong);
                    background: var(--bg-card);
                    color: var(--text-bright);
                    font-size: 0.95rem; /* حجم خط أكبر */
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease-out;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 14px; /* مسافة أكبر */
                    box-shadow: 0 1px 6px var(--shadow-light);
                }

                .monitor-channel-item:hover {
                    background: var(--bg-card-hover);
                    border-color: var(--line-strong);
                    border-right-color: var(--neon);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 10px var(--shadow-medium);
                }

                .monitor-channel-item .ch-name {
                    font-weight: 600;
                }

                .monitor-channel-item .ch-count {
                    padding: 5px 11px; /* بادينغ أكبر */
                    background: var(--accent-dim);
                    color: var(--neon);
                    border: 1px solid var(--accent-soft);
                    border-radius: 5px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .monitor-channel-item .ch-times {
                    font-size: 0.75rem; /* حجم خط أكبر */
                    color: var(--text-sub);
                    margin-top: 5px; /* مسافة أكبر */
                }

                .monitor-messages-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px; /* مسافة أكبر */
                    max-height: 650px; /* ارتفاع أقصى أكبر */
                    overflow-y: auto;
                    padding: 6px; /* بادينغ أكبر */
                }

                .monitor-message {
                    padding: 14px 16px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    background: var(--bg-base);
                    border-radius: 8px;
                    transition: all 0.3s ease-out;
                    box-shadow: 0 1px 6px var(--shadow-light);
                }

                .monitor-message:hover {
                    border-color: var(--line-strong);
                    background: var(--bg-card-hover);
                    transform: translateY(-1px);
                    box-shadow: 0 3px 10px var(--shadow-medium);
                }

                .monitor-message .msg-time {
                    font-size: 0.75rem; /* حجم خط أكبر */
                    color: var(--text-sub);
                    font-family: 'Orbitron', monospace;
                    margin-bottom: 8px; /* مسافة أكبر */
                }

                .monitor-message .msg-content {
                    color: var(--text-bright);
                    font-size: 0.95rem; /* حجم خط أكبر */
                    line-height: 1.6;
                    word-break: break-word;
                    white-space: pre-wrap;
                }
                .card {
                    background: linear-gradient(145deg, var(--bg-card), var(--bg-surface)); /* تدرج خلفية */
                    border: 1px solid var(--line-strong);
                    border-radius: 12px; /* زوايا مستديرة أكبر */
                    padding: 28px; /* بادينغ أكبر */
                    box-shadow: 0 6px 20px var(--shadow-strong);
                    transition: all 0.3s ease-out;
                }

                .card:hover {
                    border-color: var(--neon-dim); /* حدود نيون عند التحويم */
                    box-shadow: 0 8px 25px rgba(var(--neon-rgb), 0.25);
                    transform: translateY(-3px); /* تأثير رفع أكبر */
                }

                .card h3 {
                    font-size: 1.3rem; /* حجم خط أكبر */
                    margin-bottom: 25px; /* مسافة أكبر */
                    border-bottom: 1px solid var(--line);
                    padding-bottom: 18px; /* بادينغ أكبر */
                    color: var(--neon-bright); /* لون نيون ساطع */
                    display: flex;
                    align-items: center;
                    gap: 12px; /* مسافة أكبر */
                    font-weight: 700;
                    letter-spacing: 0.4px;
                    position: relative;
                    z-index: 1;
                    text-shadow: 0 0 5px rgba(var(--neon-rgb), 0.2);
                }

                .status-badge {
                    display: inline-block;
                    padding: 6px 16px; /* بادينغ أكبر */
                    border-radius: 22px; /* زوايا مستديرة أكثر */
                    font-weight: 700;
                    font-size: 0.8rem;
                    border: 1px solid;
                    transition: all 0.3s ease;
                    letter-spacing: 0.4px;
                    box-shadow: 0 2px 8px var(--shadow-light);
                }

                .status-on {
                    background: var(--success-dim);
                    color: var(--success);
                    border-color: rgba(110, 231, 183, 0.4);
                }

                .status-off {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-sub);
                    border-color: var(--line-strong);
                    box-shadow: none;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 15px; /* بادينغ أكبر */
                    border-bottom: 1px solid var(--line-soft);
                    font-size: 1rem; /* حجم خط أكبر */
                    transition: all 0.3s ease;
                    color: var(--text-soft);
                    border-radius: 8px;
                }

                .stat-item:hover {
                    background: var(--bg-card-hover);
                    color: var(--text-bright);
                    box-shadow: inset 0 0 5px rgba(var(--neon-rgb), 0.05);
                }

                .stat-item span:last-child {
                    font-weight: 700;
                    color: var(--neon);
                    font-family: 'Orbitron', monospace;
                    letter-spacing: 0.7px;
                    text-shadow: 0 0 3px rgba(var(--neon-rgb), 0.2);
                }

                .btn-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 14px; /* مسافة أكبر */
                    margin-top: 25px; /* مسافة أكبر */
                }

                .btn {
                    flex: 1;
                    min-width: 140px; /* عرض أكبر */
                    padding: 14px 22px; /* بادينغ أكبر */
                    border: 1px solid var(--line-strong);
                    border-radius: 10px; /* زوايا مستديرة أكبر */
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease-out;
                    text-decoration: none;
                    text-align: center;
                    color: var(--text-bright);
                    display: inline-block;
                    font-size: 0.9rem; /* حجم خط أكبر */
                    position: relative;
                    letter-spacing: 0.4px;
                    overflow: hidden;
                    font-family: inherit;
                    background: var(--bg-surface); /* خلفية زر */
                    box-shadow: 0 2px 8px var(--shadow-medium);
                }

                .btn::before {
                    display: none;
                }

                .btn:hover {
                    transform: translateY(-2px);
                    background: var(--bg-card-hover);
                    border-color: var(--neon-dim);
                    box-shadow: 0 6px 16px var(--shadow-strong);
                    color: var(--neon-bright);
                }

                .btn-primary {
                    background: linear-gradient(135deg, rgba(var(--neon-rgb), 0.15), var(--bg-surface));
                    border-color: rgba(var(--neon-rgb), 0.3);
                    color: var(--neon-bright);
                    box-shadow: 0 4px 15px rgba(var(--neon-rgb), 0.2);
                }

                .btn-primary:hover {
                    box-shadow: 0 6px 20px rgba(var(--neon-rgb), 0.35);
                    border-color: var(--neon);
                    background: linear-gradient(135deg, rgba(var(--neon-rgb), 0.2), var(--bg-card-hover));
                }

                .btn-success {
                    background: linear-gradient(135deg, rgba(110, 231, 183, 0.15), var(--bg-surface));
                    border-color: rgba(110, 231, 183, 0.3);
                    color: var(--success);
                    box-shadow: 0 4px 15px rgba(110, 231, 183, 0.2);
                }

                .btn-success:hover {
                    box-shadow: 0 6px 20px rgba(110, 231, 183, 0.35);
                    border-color: var(--success);
                    background: linear-gradient(135deg, rgba(110, 231, 183, 0.2), var(--bg-card-hover));
                }

                .btn-danger {
                    background: linear-gradient(135deg, rgba(255, 123, 138, 0.15), var(--bg-surface));
                    border-color: rgba(255, 123, 138, 0.3);
                    color: var(--danger);
                    box-shadow: 0 4px 15px rgba(255, 123, 138, 0.2);
                }

                .btn-danger:hover {
                    box-shadow: 0 6px 20px rgba(255, 123, 138, 0.35);
                    border-color: var(--danger);
                    background: linear-gradient(135deg, rgba(255, 123, 138, 0.2), var(--bg-card-hover));
                }

                .btn-warning {
                    background: linear-gradient(135deg, rgba(255, 204, 102, 0.15), var(--bg-surface));
                    border-color: rgba(255, 204, 102, 0.3);
                    color: #FFCC66; /* لون أصفر ذهبي */
                    box-shadow: 0 4px 15px rgba(255, 204, 102, 0.2);
                }

                .btn-warning:hover {
                    box-shadow: 0 6px 20px rgba(255, 204, 102, 0.35);
                    border-color: #FFCC66;
                    background: linear-gradient(135deg, rgba(255, 204, 102, 0.2), var(--bg-card-hover));
                }

                form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px; /* مسافة أكبر */
                    position: relative;
                    z-index: 1;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px; /* مسافة أكبر */
                }
                label {
                    font-size: 0.9rem; /* حجم خط أكبر */
                    color: var(--text-soft);
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }
                textarea {
                    width: 100%;
                    background: var(--bg-base); /* خلفية داكنة */
                    border: 1px solid var(--line);
                    padding: 14px 18px; /* بادينغ أكبر */
                    border-radius: 9px; /* زوايا مستديرة أكبر */
                    color: var(--text-bright);
                    outline: none;
                    font-size: 0.95rem; /* حجم خط أكبر */
                    font-family: inherit;
                    transition: all 0.3s ease;
                    resize: vertical;
                    min-height: 80px; /* ارتفاع أدنى أكبر */
                    box-shadow: inset 0 1px 4px var(--shadow-light);

}

textarea:hover {
                    border-color: var(--line-strong);
                    background: var(--bg-surface);
                }

                textarea:focus {
                    border-color: var(--neon-dim);
                    background: var(--bg-elevated);
                    box-shadow: inset 0 1px 4px var(--shadow-medium), 0 0 10px rgba(var(--neon-rgb), 0.2);
                }

                input[type="text"],
                input[type="number"],
                select {
                    width: 100%;
                    background: var(--bg-base);
                    border: 1px solid var(--line);
                    padding: 14px 18px; /* بادينغ أكبر */
                    border-radius: 9px;
                    color: var(--text-bright);
                    outline: none;
                    font-size: 0.95rem;
                    font-family: inherit;
                    transition: all 0.3s ease;
                    box-shadow: inset 0 1px 4px var(--shadow-light);
                }

                input:hover,
                select:hover {
                    border-color: var(--line-strong);
                    background: var(--bg-surface);
                }

                input:focus,
                select:focus {
                    border-color: var(--neon-dim);
                    background: var(--bg-elevated);
                    box-shadow: inset 0 1px 4px var(--shadow-medium), 0 0 10px rgba(var(--neon-rgb), 0.2);
                }

                input::placeholder {
                    color: var(--text-sub);
                }

                input[type="number"] {
                    direction: ltr;
                    text-align: left;
                    padding-right: 30px !important; /* بادينغ أكبر */
                }

                input[type="number"]::-webkit-outer-spin-button,
                input[type="number"]::-webkit-inner-spin-button {
                    -webkit-appearance: none !important;
                    appearance: none !important;
                    margin: 0;
                    display: none;
                }

                input[type="number"] {
                    -moz-appearance: textfield;
                }

                .num-wrap {
                    position: relative;
                    display: block;
                }

                .num-wrap .num-spin {
                    position: absolute;
                    right: 2px; /* تعديل الموضع */
                    top: 50%;
                    transform: translateY(-50%);
                    width: 26px; /* عرض أكبر */
                    height: calc(100% - 10px); /* ارتفاع أكبر */
                    display: flex;
                    flex-direction: column;
                    gap: 2px; /* مسافة أكبر */
                    pointer-events: none;
                }

                .num-wrap .num-spin button {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text-soft);
                    cursor: pointer;
                    font: inherit;
                    line-height: 1;
                    padding: 0;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    opacity: 0.8; /* شفافية أعلى */
                }

                .num-wrap .num-spin button:hover {
                    color: var(--neon-bright);
                    opacity: 1;
                }

                .num-wrap .num-spin button svg {
                    width: 9px; /* حجم أكبر */
                    height: 9px;
                    fill: currentColor;
                }

                select {
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238AA2BF' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e"); /* لون السهم */
                    background-repeat: no-repeat;
                    background-position: left 16px center; /* موضع أيقونة السهم */
                    background-size: 18px; /* حجم أيقونة السهم */
                    padding-left: 45px; /* بادينغ أيسر أكبر */
                }

                form button {
                    margin-top: 8px; /* مسافة أكبر */
                }

                .accordion-container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .accordion-item {
                    background: var(--bg-base);
                    border: 1px solid var(--line);
                    border-radius: 10px;
                    overflow: hidden;
                    transition: all 0.3s ease-out;
                    box-shadow: 0 2px 8px var(--shadow-light);
                }

                .accordion-item:hover {
                    border-color: var(--line-strong);
                    background: var(--bg-surface);
                    box-shadow: 0 4px 12px var(--shadow-medium);
                    transform: translateY(-1px);
                }

                .accordion-header {
                    padding: 16px 20px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-weight: 700;
                    color: var(--text-bright);
                    transition: all 0.3s ease;
                    user-select: none;
                    font-size: 1rem;
                }

                .accordion-header:hover {
                    color: var(--neon);
                }

                .accordion-icon {
                    font-size: 1.3rem; /* حجم أكبر */
                    transition: transform 0.3s ease;
                    color: var(--neon);
                }

                .accordion-item.active .accordion-icon {
                    transform: rotate(180deg);
                }

                .accordion-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.5s ease-out; /* انتقال أبطأ */
                    padding: 0 20px;
                }

                .accordion-item.active .accordion-content {
                    max-height: 600px; /* ارتفاع أقصى أكبر */
                    padding: 20px;
                }

                .accordion-content-inner {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .panel {
                    display: none;
                }

                .panel.active {
                    display: grid;
                }

/* ====== SCROLLBAR (ثيم الموقع) ====== */
                ::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                ::-webkit-scrollbar-track {
                    background: var(--bg-deep);
                }

                ::-webkit-scrollbar-thumb {
                    background: var(--accent-soft);
                    border-radius: 10px;
                    border: 2px solid var(--bg-deep);
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: var(--neon-dim);
                }

                ::-webkit-scrollbar-thumb:active {
                    background: var(--neon);
                }

                ::-webkit-scrollbar-corner {
                    background: var(--bg-deep);
                }

* {
                    scrollbar-width: thin;
                    scrollbar-color: var(--accent-soft) var(--bg-deep);
                }

                /* ====== AI CHAT PANEL (Gemini-style) ====== */
                .aichat-card {
                    min-height: 650px; /* ارتفاع أدنى أكبر */
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-surface);
                    box-shadow: 0 8px 30px var(--shadow-strong);
                }

                .aichat-header {
                    display: flex;
                    align-items: center;
                    gap: 16px; /* مسافة أكبر */
                    padding: 16px 20px; /* بادينغ أكبر */
                    border-radius: 10px;
                    border: 1px solid var(--line-strong);
                    background: var(--bg-card);
                    margin-bottom: 16px;
                    box-shadow: 0 2px 10px var(--shadow-medium);
                }

                .aichat-avatar {
                    width: 44px; /* حجم أكبر */
                    height: 44px;
                    display: grid;
                    place-items: center;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--accent), var(--accent-dim) 80%);
                    border: 2px solid var(--neon-dim);
                    font-size: 1.3rem;
                    color: var(--neon-bright);
                    box-shadow: 0 0 10px rgba(var(--neon-rgb), 0.3);
                }

                .aichat-title h3 {
                    margin: 0 0 4px 0;
                    border: none;
                    padding: 0;
                    color: var(--text-bright);
                    font-size: 1.1rem; /* حجم خط أكبر */
                    font-weight: 700;
                }

                .aichat-title p {
                    color: var(--text-soft);
                    font-size: 0.8rem;
                    margin: 0;
                    font-weight: 500;
                }

                .aichat-status {
                    margin-right: auto;
                    display: flex;
                    align-items: center;
                    gap: 8px; /* مسافة أكبر */
                    padding: 5px 12px; /* بادينغ أكبر */
                    border-radius: 16px;
                    background: var(--success-dim);
                    border: 1px solid rgba(110, 231, 183, 0.35);
                    color: var(--success);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .aichat-status .status-dot {
                    width: 8px; /* حجم أكبر */
                    height: 8px;
                }

                .aichat-messages {
                    flex: 1;
                    min-height: 480px; /* ارتفاع أدنى أكبر */
                    max-height: 620px; /* ارتفاع أقصى أكبر */
                    overflow-y: auto;
                    padding: 18px; /* بادينغ أكبر */
                    border: 1px solid var(--line);
                    background: var(--bg-deep);
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px; /* مسافة أكبر */
                    box-shadow: inset 0 2px 8px var(--shadow-medium);
                }

                /* Gemini-style: AI left full-width, user right compact */
                .aichat-msg {
                    display: flex;
                    gap: 12px; /* مسافة أكبر */
                    align-items: flex-start;
                    width: 100%;
                }

                .aichat-msg.user {
                    flex-direction: row-reverse;
                    max-width: 80%; /* عرض أقل */
                    margin-right: auto;
                }

                .aichat-msg.ai {
                    max-width: 100%;
                }

                .aichat-msg .msg-avatar {
                    flex: 0 0 36px; /* حجم أكبر */
                    width: 36px;
                    height: 36px;
                    display: grid;
                    place-items: center;
                    border-radius: 50%;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .aichat-msg.user .msg-avatar {
                    background: var(--accent-dim);
                    color: var(--neon);
                    border: 1px solid var(--accent-soft);
                }

                .aichat-msg.ai .msg-avatar {
                    background: linear-gradient(135deg, var(--accent), var(--bg-elevated));
                    color: var(--neon-bright);
                    border: 1px solid var(--neon-dim);
                    box-shadow: 0 0 8px rgba(var(--neon-rgb), 0.2);
                }

                .aichat-msg .msg-body {
                    min-width: 0;
                    padding: 12px 16px; /* بادينغ أكبر */
                    border-radius: 14px; /* زوايا مستديرة أكبر */
                    color: var(--text-bright);
                    font-size: 0.95rem; /* حجم خط أكبر */
                    line-height: 1.7;
                    word-break: break-word;
                    white-space: pre-wrap;
                }

                .aichat-msg.user .msg-body {
                    background: var(--accent-dim);
                    border: 1px solid var(--accent-soft);
                    box-shadow: 0 2px 8px var(--shadow-light);
                }

                .aichat-msg.ai .msg-body {
                    background: transparent;
                    padding-left: 0;
                    padding-right: 0;
                }

                .aichat-msg .msg-name {
                    display: block;
                    font-size: 0.75rem; /* حجم خط أكبر */
                    color: var(--text-sub);
                    font-weight: 600;
                    margin-bottom: 5px;
                    letter-spacing: 0.3px;
                }

                .aichat-msg.user .msg-name { color: var(--neon); }
                .aichat-msg.ai .msg-name { color: var(--text-soft); }

                .aichat-empty {
                    flex: 1;
                    display: grid;
                    place-items: center;
                    text-align: center;
                    color: var(--text-soft);
                    font-size: 1rem; /* حجم خط أكبر */
                    padding: 50px 25px;
                }

                .aichat-greeting {
                    font-size: 3rem; /* حجم خط أكبر */
                    font-weight: 800;
                    font-family: 'Cairo', 'Tajawal', sans-serif;
                    letter-spacing: 1.5px;
                    color: var(--neon-bright);
                    text-shadow:
                        0 0 10px var(--neon-glow-strong),
                        0 0 25px var(--neon-glow-strong),
                        0 0 40px var(--neon-dim);
                    animation: neonPulse 2.8s ease-in-out infinite; /* أنيميشن أبطأ */
                }

                @keyframes neonPulse {
                    0%, 100% {
                        opacity: 0.6;
                        text-shadow:
                            0 0 5px var(--neon-dim),
                            0 0 15px var(--neon-dim),
                            0 0 25px transparent;
                    }
                    50% {
                        opacity: 1;
                        text-shadow:
                            0 0 10px var(--neon-glow-strong),
                            0 0 30px var(--neon-glow-strong),
                            0 0 50px var(--neon-dim);
                    }
                }

                .aichat-greeting.fade-out {
                    animation: fadeOut 0.5s ease-out forwards; /* أنيميشن أبطأ */
                }

                @keyframes fadeOut {
                    to { opacity: 0; transform: translateY(-10px); }
                }

                .aichat-typing {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px; /* مسافة أكبر */
                    padding: 5px 0;
                }

                .aichat-typing span {
                    width: 8px; /* حجم أكبر */
                    height: 8px;
                    border-radius: 50%;
                    background: var(--neon-bright);
                    display: inline-block;
                    animation: aichatDot 1.2s ease-in-out infinite; /* أنيميشن أبطأ */
                    opacity: 0.6;
                }

                .aichat-typing span:nth-child(2) { animation-delay: 0.2s; } /* تأخير أكبر */
                .aichat-typing span:nth-child(3) { animation-delay: 0.4s; }

                .aichat-input {
                    display: flex;
                    gap: 10px; /* مسافة أكبر */
                    margin-top: 15px;
                    padding: 8px; /* بادينغ أكبر */
                    background: var(--bg-card);
                    border: 1px solid var(--line-strong);
                    border-radius: 14px;
                    transition: border-color 0.2s ease;
                    box-shadow: 0 2px 10px var(--shadow-medium);
                }

                .aichat-input:focus-within {
                    border-color: var(--accent);
                }

                .aichat-input input {
                    flex: 1;
                    min-width: 0;
                    background: transparent;
                    border: none;
                    padding: 12px 14px; /* بادينغ أكبر */
                    color: var(--text-bright);
                    outline: none;
                    font-size: 0.95rem;
                    font-family: inherit;
                }

                .aichat-input input:focus {
                    box-shadow: none;
                    background: transparent;
                }

                .aichat-input input::placeholder {
                    color: var(--text-sub);
                }

                .aichat-input .btn {
                    flex: 0 0 auto;
                    min-width: 110px; /* عرض أكبر */
                    border-radius: 10px;
                    margin: 0;
                    font-size: 0.9rem;
                }

                .aichat-quickbar {
                    display: flex;
                    align-items: center;
                    gap: 8px; /* مسافة أكبر */
                    margin-top: 12px;
                    flex-wrap: wrap;
                }

                .aichat-quickbar-label {
                    color: var(--text-sub);
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-left: 5px;
                }

                .aichat-quickbar button {
                    padding: 7px 14px; /* بادينغ أكبر */
                    background: var(--bg-surface);
                    border: 1px solid var(--line);
                    color: var(--text-soft);
                    border-radius: 16px;
                    font: inherit;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 5px var(--shadow-light);
                }

                .aichat-quickbar button:hover {
                    background: var(--bg-card-hover);
                    color: var(--neon);
                    border-color: var(--neon-dim);
                    box-shadow: 0 2px 8px var(--shadow-medium);
                }

                .aichat-error {
                    color: var(--danger);
                    background: var(--danger-dim);
                    border: 1px solid rgba(255, 123, 138, 0.35);
                    padding: 10px 14px;
                    border-radius: 8px;
                }

                .aichat-cursor {
                    display: inline-block;
                    width: 8px; /* عرض أكبر */
                    height: 1.1em; /* ارتفاع أكبر */
                    background: var(--neon-bright);
                    margin-left: 3px;
                    vertical-align: text-bottom;
                    animation: cursorBlink 0.7s step-end infinite; /* أنيميشن أسرع قليلاً */
                    box-shadow: 0 0 8px var(--neon-glow);
                }

                @keyframes cursorBlink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }

                .aichat-msg .msg-model {
                    display: inline-block;
                    margin-right: 8px;
                    padding: 2px 9px;
                    background: var(--accent-dim);
                    border: 1px solid var(--accent-soft);
                    border-radius: 12px;
                    font-size: 0.65rem;
                    color: var(--neon);
                    font-weight: 600;
                    vertical-align: middle;
                }

@media (max-width: 768px) {
                    body { padding: 20px 12px 60px; }
                    header { padding: 24px 20px; margin-bottom: 24px; }
                    header h1 { font-size: 1.8rem; }
                    .grid { grid-template-columns: 1fr; gap: 20px; }
                    .btn-group { flex-direction: column; }
                    .btn { min-width: 100%; }
                    .task-row { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; }
                    .task-state { margin-right: 0; margin-bottom: 8px; }
                    .task-row .btn { width: 100%; }
                    .timing-fields { grid-template-columns: 1fr; }
                    .target-title,
                    .target-add,
                    .target-mode { align-items: stretch; flex-direction: column; }
                    .target-add .btn,
                    .target-mode select { width: 100%; }
                    .card { padding: 20px; }
                    .dashboard-nav { flex-direction: column; border-radius: 12px; }
                    .dashboard-nav button { border-radius: 8px; padding: 12px; font-size: 1rem; }
                    .aichat-header { flex-direction: column; text-align: center; gap: 12px; padding: 16px; }
                    .aichat-status { margin: 0 auto; }
                    .aichat-msg { max-width: 95%; }
                    .aichat-msg.user { max-width: 95%; }
                    .aichat-input-wrapper { padding: 16px; }
                    .aichat-input { flex-direction: column; }
                    .aichat-input .btn { width: 100%; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>◆ لوحة التحكم الفضائية ◆</h1>
                    <p>إدارة متقدمة لـ Discord Selfbot والذكاء الاصطناعي</p>
                    <div class="status-line">
                        <div class="status-indicator">
                            <span class="status-dot ${botState.isRunning ? 'active' : 'inactive'}"></span>
                            <span>البوت: ${botState.isRunning ? 'نشط' : 'متوقف'}</span>

</div>

<div class="status-indicator">
                            <span class="status-dot ${botState.isVoiceActive ? 'active' : 'inactive'}"></span>
                            <span>الصوت: ${botState.isVoiceActive ? 'متصل' : 'مفصول'}</span>

</div>

<div class="status-indicator">
                            <span class="status-dot ${botState.isPlanBRunning ? 'active' : 'inactive'}"></span>
                            <span>خطة ب: ${botState.isPlanBRunning ? 'مشغلة' : 'متوقفة'}</span>

</div>

</div>

</header>

<nav class="dashboard-nav" aria-label="أقسام لوحة التحكم">
                    <button type="button" class="active" data-panel-target="overview">🪐 النظرة العامة</button>
                    <button type="button" data-panel-target="tasks">⚡ إدارة المهام</button>
                    <button type="button" data-panel-target="channels">📡 القنوات والرسائل</button>
                    <button type="button" data-panel-target="monitor">🔭 المراقبة</button>
                    <button type="button" data-panel-target="aichat">🧠 شات الذكاء الاصطناعي</button>
                </nav>

                <div style="display:flex; flex-direction:column; gap:30px;">
                    <div class="grid panel active" data-panel="overview">
                    <div class="card">
                        <h3>⚙️ حالة النظام</h3>

<div class="stat-item">

<span>البوت الرئيسي</span>
                            <span class="status-badge ${botState.isRunning ? 'status-on' : 'status-off'}">${botState.isRunning ? 'نشط' : 'متوقف'}</span>
                            </div>

<div class="stat-item">

<span>قناة الصوت</span>
                            <span class="status-badge ${botState.isVoiceActive ? 'status-on' : 'status-off'}">${botState.isVoiceActive ? 'متصلة' : 'مفصولة'}</span>
                            </div>

<div class="stat-item">

<span>الخطة ب</span>
                            <span class="status-badge ${botState.isPlanBRunning ? 'status-on' : 'status-off'}">${botState.isPlanBRunning ? 'مشغلة' : 'متوقفة'}</span>
                            </div>

                        <div class="btn-group">
                            <button type="button" class="btn btn-primary" data-action="voice" onclick="toggleAction('voice', this)">${botState.isVoiceActive ? '🔇 إيقاف صوت' : '🔊 تشغيل صوت'}</button>
                            <button type="button" class="btn btn-warning" data-action="bot" onclick="toggleAction('bot', this)">${botState.isRunning ? '🔴 إيقاف البوت' : '🟢 تشغيل البوت'}</button>

</div>

</div>

<!-- إحصائيات النشاط -->
                    <div class="card">
                        <h3>📊 إحصائيات النشاط</h3>
                        <div class="stat-item"><span>إجمالي المرسل</span> <span>${s.totalSent || 0}</span></div>
                        <div class="stat-item"><span>المهمة الأولى (ذكريات)</span> <span>${s.task1CountLog || 0}</span></div>
                        <div class="stat-item"><span>المهمة الثانية (بخشيش)</span> <span>${s.task2CountLog || 0}</span></div>
                        <div class="stat-item"><span>المهمة الثالثة (عمل/جريمة)</span> <span>${s.task3CountLog || 0}</span></div>
                        <div class="stat-item"><span>المهمة الرابعة (هجوم)</span> <span>${s.task4CountLog || 0}</span></div>
                        <div class="stat-item"><span>المهمة الخامسة (كازينو)</span> <span>${s.task5CountLog || 0}</span></div>
                        <div class="stat-item"><span>آخر نشاط</span> <span style="font-size:0.85rem">${s.lastActiveTime || 'لا يوجد'}</span></div>

</div>

</div>

<div class="grid panel" data-panel="tasks">
                    <div class="card task-manager">
                        <h3>⚡ إدارة المهام</h3>
                        <div class="task-list">
                            <div class="task-row">
                                <span class="task-name"><span class="task-number">01</span>ذكريات</span>
                                <span class="task-state">${taskActive('task1') ? 'مفعلة' : 'متوقفة'}</span>
                                <button type="button" class="btn ${taskActive('task1') ? 'btn-danger' : 'btn-success'}" data-task="task1" onclick="toggleTask('task1', this)">${taskActive('task1') ? '⏹ إيقاف' : '▶ تشغيل'}</button>
                            </div>
                            <div class="task-row">
                                <span class="task-name"><span class="task-number">02</span>بخشيش</span>
                                <span class="task-state">${taskActive('task2') ? 'مفعلة' : 'متوقفة'}</span>
                                <button type="button" class="btn ${taskActive('task2') ? 'btn-danger' : 'btn-success'}" data-task="task2" onclick="toggleTask('task2', this)">${taskActive('task2') ? '⏹ إيقاف' : '▶ تشغيل'}</button>
                            </div>
                            <div class="task-row">
                                <span class="task-name"><span class="task-number">03</span>عمل / جريمة</span>
                                <span class="task-state">${taskActive('task3') ? 'مفعلة' : 'متوقفة'}</span>
                                <button type="button" class="btn ${taskActive('task3') ? 'btn-danger' : 'btn-success'}" data-task="task3" onclick="toggleTask('task3', this)">${taskActive('task3') ? '⏹ إيقاف' : '▶ تشغيل'}</button>

</div>

<div class="task-row">
                                <span class="task-name"><span class="task-number">04</span>هجوم</span>
                                <span class="task-state">${taskActive('task4') ? 'مفعلة' : 'متوقفة'}</span>
                                <button type="button" class="btn ${taskActive('task4') ? 'btn-danger' : 'btn-success'}" data-task="task4" onclick="toggleTask('task4', this)">${taskActive('task4') ? '⏹ إيقاف' : '▶ تشغيل'}</button>
                            </div>
                            <div class="task-row">
                                <span class="task-name"><span class="task-number">05</span>سوق الكازينو</span>
                                <span class="task-state">${taskActive('task5') ? 'مفعلة' : 'متوقفة'}</span>
                                <button type="button" class="btn ${taskActive('task5') ? 'btn-danger' : 'btn-success'}" data-task="task5" onclick="toggleTask('task5', this)">${taskActive('task5') ? '⏹ إيقاف' : '▶ تشغيل'}</button>

</div>

</div>
                    </div>

                    <div class="card timing-manager">
                        <h3>⏱️ توقيت المهام</h3>
                        <form action="/api/update-tasks-config" method="POST">
                            <div class="timing-group">
                                <label>المهمة 1 - ذكريات: الفاصل بين الرسائل (ثواني)</label>
                                <div class="num-wrap">
                                    <input type="number" name="task1MessageGap" value="${c.task1MessageGap || 5}" min="3" step="0.1" placeholder="مثال: 5">
                                    <div class="num-spin">
                                        <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                        <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                </div>
            </div>
                            </div>
                            <div class="timing-group">
                                <label>المهمة 1 - ذكريات: التكرار (دقائق)</label>
                                <div class="timing-fields">
                                    <div class="num-wrap">
                                        <input type="number" name="task1RepeatMin" value="${c.task1RepeatMin || 30}" min="0.1" step="0.1" placeholder="من">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                    <div class="num-wrap">
                                        <input type="number" name="task1RepeatMax" value="${c.task1RepeatMax || 35}" min="0.1" step="0.1" placeholder="إلى">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="timing-group">
                                <label>المهمة 2 - بخشيش: التكرار (دقائق)</label>
                                <div class="timing-fields">
                                    <div class="num-wrap">
                                        <input type="number" name="task2RepeatMin" value="${c.task2RepeatMin || 30}" min="0.1" step="0.1" placeholder="من">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                    <div class="num-wrap">
                                        <input type="number" name="task2RepeatMax" value="${c.task2RepeatMax || 32}" min="0.1" step="0.1" placeholder="إلى">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="timing-group">
                                <label>المهمة 3 - عمل/جريمة: التكرار (دقائق)</label>
                                <div class="timing-fields">
                                    <div class="num-wrap">
                                        <input type="number" name="task3RepeatMin" value="${c.task3RepeatMin || 50}" min="0.1" step="0.1" placeholder="من">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                    <div class="num-wrap">
                                        <input type="number" name="task3RepeatMax" value="${c.task3RepeatMax || 52}" min="0.1" step="0.1" placeholder="إلى">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="timing-group">
                                <label>المهمة 4 - هجوم: التكرار (دقائق)</label>
                                <div class="timing-fields">
                                    <div class="num-wrap">
                                        <input type="number" name="task4RepeatMin" value="${c.task4RepeatMin || 30}" min="0.1" step="0.1" placeholder="من">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                    <div class="num-wrap">
                                        <input type="number" name="task4RepeatMax" value="${c.task4RepeatMax || 32}" min="0.1" step="0.1" placeholder="إلى">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="timing-group">
                                <label>المهمة 5 - كازينو: الفاصل بين الألعاب (ثواني)</label>
                                <div class="timing-fields">
                                    <div class="num-wrap">
                                        <input type="number" name="task5GapMin" value="${c.task5GapMin || 10}" min="0.1" step="0.1" placeholder="من">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                    <div class="num-wrap">
                                        <input type="number" name="task5GapMax" value="${c.task5GapMax || 12}" min="0.1" step="0.1" placeholder="إلى">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="timing-group">
                                <label>المهمة 5 - كازينو: قيمة الرهان (من - إلى)</label>
                                <div class="timing-fields">
                                    <div class="num-wrap">
                                        <input type="number" name="task5BetMin" value="${c.task5BetMin || 5000}" min="1" step="1" placeholder="من">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                    <div class="num-wrap">
                                        <input type="number" name="task5BetMax" value="${c.task5BetMax || 10000}" min="1" step="1" placeholder="إلى">
                                        <div class="num-spin">
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                            <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="timing-group">
                                <label>خطة ب - جمع النقاط: التكرار (ثواني)</label>
                                <div class="num-wrap">
                                    <input type="number" name="planBRepeat" value="${c.planBRepeat || 2.5}" min="0.1" step="0.1" placeholder="مثال: 2.5">
                                    <div class="num-spin">
                                        <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                        <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">💾 حفظ التوقيت</button>
                        </form>

</div>

<div class="card planb-card">
                        <h3>✦ خطة ب - جمع النقاط</h3>
                        <div class="task-row">
                            <span class="task-name"><span class="task-number">ب</span>إرسال الرسائل السريعة</span>
                            <span class="task-state">${planBActive ? 'مفعلة' : 'متوقفة'}</span>
                            <button type="button" class="btn ${planBActive ? 'btn-danger' : 'btn-success'}" data-planb="1" onclick="togglePlanB(this)">${planBActive ? '⏹ إيقاف' : '▶ تشغيل'}</button>
                        </div>
                    </div>

                    <div class="card target-manager ${c.task4TargetMode === 'random' ? 'random-mode' : ''}">
                        <div class="target-title">
                            <div>
                                <h3>🎯 أهداف الهجوم - المهمة 4</h3>
                                <p>أضف الأعضاء وحدد عضوًا أساسيًا واحدًا</p>
                            </div>
                            <span class="target-count">${targetIds.length} أهداف</span>
                        </div>
                        <form id="targetsForm" action="/api/update-tasks-config" method="POST">
                            <input type="hidden" name="task4TargetIds" id="task4TargetIds">
                            <input type="hidden" name="task4TargetId" id="task4TargetId" value="${primaryTargetId}">
                            <div class="target-add">
                                <input type="text" id="newTargetId" placeholder="أدخل ID عضو جديد">
                                <button type="button" class="btn btn-primary" onclick="addTarget()">➕ إضافة عضو</button>
                            </div>
                            <div class="target-list" id="targetList">${targetRows}</div>
                            <div class="target-mode">
                                <label for="task4TargetMode">طريقة الهجوم</label>
                                <select id="task4TargetMode" name="task4TargetMode">
                                    <option value="fixed" ${c.task4TargetMode !== 'random' ? 'selected' : ''}>الهدف الأساسي كل دورة</option>
                                    <option value="random" ${c.task4TargetMode === 'random' ? 'selected' : ''}>هدف عشوائي من القائمة</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary target-save">💾 حفظ أهداف الهجوم</button>
                        </form>
                    </div>
                </div>

                <div class="grid panel" data-panel="channels">
                    <!-- إدارة القنوات الصوتية -->
                    <div class="card">
                        <h3>🎙️ إدارة القنوات الصوتية</h3>
                        <form action="/api/update-tasks-config" method="POST">
                            <div class="form-group">
                                <label>🔴 قناة ال AFK (الانتظار)</label>
                                <input type="text" name="afkChannelId" value="${c.afkChannelId || ''}" placeholder="أدخل رقم القناة">
                            </div>
                            <button type="submit" class="btn btn-primary" style="margin-top: 15px;">💾 حفظ</button>
                        </form>
                    </div>

                    <!-- حذف الرسائل -->
                    <div class="card">
                        <h3>🗑️ حذف الرسائل</h3>
                        <div class="form-group">
                            <label>🔧 ID الروم</label>
                            <input type="text" id="deleteChannelId" placeholder="أدخل ID الروم" required>
                        </div>
                        <div class="form-group">
                            <label>📨 عدد الرسائل</label>
                            <div class="num-wrap">
                                <input type="number" id="deleteMessageCount" placeholder="مثال: 50" min="1" max="100" value="50">
                                <div class="num-spin">
                                    <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepUp()"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                                    <button type="button" tabindex="-1" onclick="this.previousElementSibling.stepDown()"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger" onclick="deleteMessages()" style="width: 100%;">🗑️ حذف الرسائل</button>
                    </div>
                </div>

                <div class="grid panel" data-panel="monitor">
                    <div class="card">
                        <h3>🛰️ مراقبة نشاط المستخدم</h3>
                        <div class="form-group">
                            <label>👤 ID الشخص (المستخدم)</label>
                            <input type="text" id="monitorUserId" placeholder="أدخل ID الشخص">
                        </div>
                        <div class="form-group">
                            <label>⏰ الفترة الزمنية</label>
                            <select id="monitorHours">
                                <option value="1">آخر ساعة</option>
                                <option value="6">آخر 6 ساعات</option>
                                <option value="24" selected>آخر 24 ساعة</option>
                                <option value="72">آخر 3 أيام</option>
                                <option value="168">آخر أسبوع</option>
                                <option value="720">آخر شهر</option>
                            </select>
                        </div>
                        <div class="btn-group">
                            <button type="button" class="btn btn-primary" id="monitorStartBtn" onclick="startMonitor()">🔍 بدء المراقبة</button>
                            <button type="button" class="btn btn-danger" id="monitorStopBtn" onclick="stopMonitor()" style="display:none;">⏹ إيقاف</button>
                        </div>
                        <div id="monitorProgress" style="margin-top:20px; display:none;">
                            <div class="stat-item">
                                <span>الحالة</span>
                                <span id="monitorStatus">جاري الفحص...</span>
                            </div>
                            <div class="stat-item">
                                <span>القنوات المفحوصة</span>
                                <span id="monitorProgressText">0 / 0</span>
                            </div>
                            <div class="stat-item">
                                <span>القناة الحالية</span>
                                <span id="monitorCurrentChannel" style="font-size:0.85rem;">—</span>
                            </div>
                        </div>
                    </div>

                    <div class="card" id="monitorStatsCard" style="display:none;">
                        <h3>📊 ملخص المراقبة</h3>
                        <div class="stat-item"><span>إجمالي الرسائل</span> <span id="monitorTotalMessages">0</span></div>
                        <div class="stat-item"><span>القنوات النشطة</span> <span id="monitorActiveChannels">0</span></div>
                        <div class="stat-item"><span>القنوات المفحوصة</span> <span id="monitorChannelsScanned">0</span></div>
                        <div class="stat-item"><span>من</span> <span id="monitorFirstTime" style="font-size:0.85rem">—</span></div>
                        <div class="stat-item"><span>إلى</span> <span id="monitorLastTime" style="font-size:0.85rem">—</span></div>
                        <div class="stat-item"><span>المدة</span> <span id="monitorDuration" style="font-size:0.85rem">—</span></div>
                    </div>

                    <div class="card" id="monitorChannelsCard" style="display:none;">
                        <h3>📡 القنوات النشطة <span id="monitorChannelsCount" class="target-count">0</span></h3>
                        <p style="color:var(--text-sub); font-size:0.88rem; margin-bottom:16px;">اضغط على أي قناة لعرض الرسائل</p>
                        <div class="target-list" id="monitorChannelsList"></div>
                    </div>

                    <div class="card" id="monitorMessagesCard" style="display:none;">
                        <h3>💬 الرسائل <button type="button" class="btn btn-primary" style="float:left; padding:7px 14px; min-width:auto; font-size:0.85rem;" onclick="closeMessages()">✕ إغلاق</button></h3>
                        <p style="color:var(--text-sub); font-size:0.88rem; margin-bottom:16px;">القناة: <span id="monitorMessagesChannel" style="color:var(--neon);"></span></p>
                        <div class="monitor-messages-list" id="monitorMessagesList"></div>
                    </div>
                </div>

                <div class="grid panel" data-panel="aichat">
                    <div class="card aichat-card">
                        <div class="aichat-header">
                            <div class="aichat-avatar">🤖</div>
                            <div class="aichat-title">
                                <h3>المساعد الذكي</h3>
                                <p>نماذج ذكاء اصطناعي متعددة • رد فوري بالعربية</p>
                            </div>
                            <div class="aichat-status" id="aichatStatus">
                                <span class="status-dot active"></span>
                                <span>متصل</span>
                            </div>
                        </div>

                        <div class="aichat-messages" id="aichatMessages">
                            <div class="aichat-empty" id="aichatEmpty">
                                <div class="aichat-greeting">مرحبا Anas</div>
                            </div>
                        </div>

                        <div class="aichat-quickbar">
                            <span class="aichat-quickbar-label">اختصارات:</span>
                            <button type="button" onclick="aichatClear()">🗑️ مسح المحادثة</button>
                            <button type="button" onclick="useAIPrompt('لخص هذا النص: ')">📋 تلخيص</button>
                            <button type="button" onclick="useAIPrompt('ترجم للإنجليزية: ')">🌐 ترجمة</button>
                            <button type="button" onclick="useAIPrompt('اشرح ببساطة: ')">💡 شرح</button>
                            <button type="button" onclick="useAIPrompt('حلل هذا الكود: ')">💻 تحليل كود</button>
                        </div>

                        <form class="aichat-input" id="aichatForm" onsubmit="event.preventDefault(); sendAIMessage();">
                            <input type="text" id="aichatInput" placeholder="اكتب رسالتك هنا... (Enter للإرسال)" autocomplete="off" maxlength="4000" required>
                            <button type="submit" class="btn btn-warning" id="aichatSendBtn">🚀 إرسال</button>
                        </form>
                    </div>
                </div>
            </div>

            <script>
                function pulseButton(btn) {
                    btn.classList.remove('pulse-anim');
                    void btn.offsetWidth;
                    btn.classList.add('pulse-anim');
                }

                function toggleTask(taskName, btn) {
                    pulseButton(btn);
                    fetch('/api/toggle-task/' + taskName, { method: 'GET' });
                }

                function togglePlanB(btn) {
                    pulseButton(btn);
                    fetch('/api/toggle-planb', { method: 'GET' });
                }

                function toggleAction(action, btn) {
                    pulseButton(btn);
                    fetch('/api/toggle/' + action, { method: 'GET' });
                }

                function isTaskActive(state, name) {
                    return state.isRunning && state.isChatActive && state.isTaskRunning && state.taskStates && state.taskStates[name];
                }

                function applyBtnState(btn, isActive, onText, offText) {
                    btn.textContent = isActive ? onText : offText;
                    btn.classList.toggle('btn-danger', isActive);
                    btn.classList.toggle('btn-success', !isActive);
                }

                function refreshState() {
                    fetch('/api/state').then(r => r.json()).then(data => {
                        if (!data.success) return;
                        const s = data.state;
                        document.querySelectorAll('[data-task]').forEach(btn => {
                            applyBtnState(btn, isTaskActive(s, btn.dataset.task), '⏹ إيقاف', '▶ تشغيل');
                        });
                        const planbBtn = document.querySelector('[data-planb]');
                        if (planbBtn) {
                            applyBtnState(planbBtn, !!s.isPlanBRunning, '⏹ إيقاف', '▶ تشغيل');
                        }
                        const voiceBtn = document.querySelector('[data-action="voice"]');
                        if (voiceBtn) {
                            voiceBtn.textContent = s.isVoiceActive ? '🔇 إيقاف صوت' : '🔊 تشغيل صوت';
                        }
                    }).catch(() => {});
                }

                setInterval(refreshState, 300);
                refreshState();
                document.querySelectorAll('[data-panel-target]').forEach(button => {
                    button.addEventListener('click', function(event) {
                        event.preventDefault();
                        const target = this.getAttribute('data-panel-target');
                        document.querySelectorAll('[data-panel-target]').forEach(item => item.classList.remove('active'));
                        document.querySelectorAll('.panel').forEach(panel => {
                            panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
                        });
                        this.classList.add('active');
                    });
                });

                document.querySelectorAll('.accordion-header').forEach(header => {
                    header.addEventListener('click', function() {
                        const item = this.parentElement;
                        item.classList.toggle('active');
                    });
                });

                function deleteMessages() {
                    const channelId = document.getElementById('deleteChannelId').value.trim();

const count = document.getElementById(
