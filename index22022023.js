//nisan's change//

    /* initialize jsPsych */
    var jsPsych = initJsPsych({
        override_safe_mode: true,
        on_finish: function() {}
    });

    var trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<div style="width:300px; height: 300px; background-color: #333; margin: auto;"></div>',
        choices: 'q',
        trial_duration: null,
        /* extensions: [{
         *     type: jsPsychExtensionMouseTracking,
         *     params: {
         *         targets: ['#target']
         *     }
         * }], */
        data: {
            task: 'trial',
            subject: {
                id: null,
                age: null,
                sex: null,
                handedness: null,
                mousetype: null,
                returner: null,
                currTrial: 0,
                tgt_file: null,
                ethnicity: null,
                race: null,
                comments: null,
                distractions: [],
                distracto: null,
                dpi: null
            },
            subjTrials: {
                id: null,
                experimentID: null,
                trialNum: [],
                currentDate: [],
                target_angle: [],
                trial_type: [],
                rotation: [],
                hand_fb_angle: [],
                rt: [],
                mt: [],
                search_time: [],
                reach_feedback: [],
                group_type: null,
                participant_category_resp: [],
                practice_trial: []
            }
        },
        on_finish: function(data) {

            /* jsPsych.data.addProperties({
             *     subjTrials: subjTrials
             * }); */

            subject = data.subject;
            subjTrials = data.subjTrials;

            var fileName = "tgt_files/testShort.json";
            // var fileName = "/Users/Patrick/Desktop/PACE reaching experiment/OnPoint-Pavlovia/tgt_files/testShort.json"

            $.getJSON(fileName, function(target_file_data) {

                var experiment_ID = 'simple_reach';
                var begin;
                var timing = false;
                var if_slow = false;
                var counter = 1;

                var totalTrials = target_file_data.numtrials[0];
                // var totalTrials = 6;

                var rotation = target_file_data.rotation;
                var target_angle = target_file_data.tgt_angle;
                var online_fb = target_file_data.online_fb;
                var endpt_fb = target_file_data.endpoint_feedback;
                var clamped_fb = target_file_data.clamped_fb;
                var between_blocks = target_file_data.between_blocks;
                var target_jump = target_file_data.target_jump;
                var num_trials = target_file_data.numtrials;
                var stim_id = target_file_data.stim_id;
                var img_file = target_file_data.img_file
                var correct_resp = target_file_data.correct_resp;
                var participant_category_resp = [];
                var practice_trial = target_file_data.practice_trial;
                var trialnum = target_file_data.trialnum;
                // var practice_trial = [true, true, true, true, false, false];

                var screen_height = window.screen.availHeight;
                var screen_width = window.screen.availWidth;
                var prev_height = screen_height;
                var prev_width = screen_width;

                var trial = 0;

                var SEARCHING = 0;
                var HOLDING = 1;
                var SHOW_TARGETS = 2;
                var MOVING = 3;
                var FEEDBACK = 4;
                var BETWEEN_BLOCKS = 5;
                var game_phase = BETWEEN_BLOCKS;

                var target_invisible = true;
                var cursor_show = true;

                var instr_counter = 0;
                var bb_mess = between_blocks[0];
                var line_size = Math.round(screen_height / 30);
                var message_size = String(line_size).concat("px");

                var hand_angle = 0;
                var hand_fb_angle = 0;
                var rt = 0;
                var mt = 0;
                var search_time = 0;
                var feedback_time = 2000;
                var feedback_time_slow = 2250;
                var hold_time = 500;
                var hold_timer = null;
                var fb_timer = null;

                var start_x = screen_width / 2;
                var start_y = screen_height / 2;
                var start_radius = Math.round(screen_height/4 * 4.5 / 80.0);
                var start_color = 'blue';

                var target_dist = screen_width/4;
                var target_radius = screen_height/4;
                var target_color = 'blue';
                var target_fixation_dist = screen_width/4;
                var target_x = start_x+target_fixation_dist;
                var target_x2 = start_x-target_fixation_dist;
                var target_y = screen_height / 2;

                var hand_x = 0;
                var hand_y = 0;
                var hand_fb_x = 0;
                var hand_fb_y = 0;

                var r = 0;
                var cursor_x = 0;
                var cursor_y = 0;
                var cursor_radius = Math.round(target_radius * 1.75 * 1.5 / 80.0);
                var cursor_color = 'blue';

                var search_tolerance = start_radius * 4 + cursor_radius * 4;

                // // Initialise Practice trials
                // var practice_no = [];
                // if (practice_trial[trial] == true){
                //   practice_no ++;
                // }
                // console.log('practice_no: ' + practice_no);

                if (trial == 0) {
                    moveCursor();
                }

                $('html').css('height', screen_height);
                $('html').css('width', screen_width);
                $('html').css('background-color', 'black')
                $('body').css('height', screen_height);
                $('body').css('width', screen_width);
                $('body').css('background-color', 'rgba(128,128,128,255)')
                $('#jspsych-content').css('height', screen_height);
                $('#jspsych-content').css('width', screen_width);
                $('#jspsych-content').css('background-color', 'rgba(128,128,128,255)')

                $('html').css('cursor', 'none');
                $('body').css('cursor', 'none');
                $('#jspsych-content').css('cursor', 'none');

                messages = [
                    ["Dummy Message Test"],
                    ["Your task is to move the cursor either to the left or right side of the screen.",
                        "Please reach as close to the centre of the circle as possible.",
                        "Press 'b' when you are ready to proceed."],
                    ["This is an instruction understanding check, you may proceed ONLY if you choose the correct choice.",
                        "Choosing the wrong choice will result in early game termination and an incomplete HIT!",
                        "Press 'a' when you are ready to proceed."],
                    ["The white dot will now be hidden.",
                        "Continue aiming DIRECTLY towards the target.",
                        "Press SPACE BAR when you are ready to proceed."],
                    ["This is an attention check.",
                        "Press the key 'e' on your keyboard to CONTINUE.",
                        "Pressing any other key will result in a premature game termination and an incomplete HIT!"],
                    ["This is an attention check.",
                        "Press the key 'a' on your keyboard to CONTINUE.",
                        "Pressing any other key will result in a premature game termination and an incomplete HIT!"],
                    ["The white dot will no longer be under your control.",
                        "IGNORE the white dot as best as you can and continue aiming DIRECTLY towards the target.",
                        "This will be a practice trial",
                        "Press SPACE BAR when you are ready to proceed."],
                    ["Test test 1",
                        "During the experiment you will encounter",
                        "circles with black and white stripes like this.",
                        "Press F when you are ready to proceed."],
                    ["Test test 2",
                        "Each cricle can differ in the thickness of the stripes.",
                        "Press a when you are ready to proceed."],
                    ["Test test 3",
                        "They can also differ in the angle of the striples.",
                        "Press B when you are ready to proceed."],
                    ["Test test 4",

                        "Press SPACE BAR when you are ready to proceed."]
              ];

                svgContainer = d3.select("#jspsych-content").append("svg")
                    .attr('width', screen_width)
                    .attr('height', screen_height)
                    .attr('fill', 'black')
                    .attr('id', 'stage')
                    .attr('background-color', 'black');

                svgContainer.append('circle')
                    .attr('cx', start_x)
                    .attr('cy', start_y)
                    .attr('r', start_radius)
                    .attr('fill', 'none')
                    .attr('stroke', start_color)
                    .attr('stroke-width', 2)
                    .attr('id', 'start')
                    .attr('display', 'none');
                //edited this out
                // svgContainer.append('circle')
                //     .attr('cx', target_x)
                //     .attr('cy', target_y)
                //     .attr('r', target_radius)
                //     .attr('fill', target_color)
                //     .attr('id', 'target')
                //     .attr('display', 'none');

                //stimulus images
                svgContainer.append('svg:image')
   	                .attr('x', target_x-target_radius/2)
   	                .attr('y', target_y-target_radius/2)
   	                .attr('width', target_radius)
   	                .attr('height', target_radius)
   	                .attr('xlink:href', `img/0_practice.png`)
   	                .attr('id', 'target')
                    .attr('display', 'block');

                svgContainer.append('svg:image')
                    .attr('x', target_x2-target_radius/2)
                    .attr('y', target_y-target_radius/2)
                    .attr('width', target_radius)
                    .attr('height', target_radius)
                    .attr('xlink:href', `img/1_practice.png`)
                    .attr('id', 'target2')
                    .attr('display', 'block');

                //draw circle around target for feedback
                svgContainer.append('circle')
                    .attr('cx', target_x)
                    .attr('cy', target_y)
                    .attr('r', start_radius*9)
                    .attr('fill', 'none')
                    .attr('stroke', 'purple')
                    .attr('stroke-width', 8)
                    .attr('id', 'feedback_circleR')
                    .attr('display', 'none');

                svgContainer.append('circle')
                    .attr('cx', target_x2)
                    .attr('cy', target_y)
                    .attr('r', start_radius*9)
                    .attr('fill', 'none')
                    .attr('stroke', 'purple')
                    .attr('stroke-width', 8)
                    .attr('id', 'feedback_circleL')
                    .attr('display', 'none');

               //cursor
                svgContainer.append('circle')
                    .attr('cx', hand_x)
                    .attr('cy', hand_y)
                    .attr('r', cursor_radius)
                    .attr('fill', cursor_color)
                    .attr('id', 'cursor')
                    .attr('display', 'none');

                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height*3/4 - line_size)
                    .attr('fill', 'white')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'mouse_wiggle_notice')
                    .attr('display', 'none')
                    .text('Your cursor will appear when you move your mouse.');

                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 2 - line_size)
                    .attr('fill', 'white')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'message-line-1')
                    .attr('display', 'block')
                    .text(messages[7][0]);

                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 2)
                    .attr('fill', 'white')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'message-line-2')
                    .attr('display', 'block')
                    .text(messages[7][1]);

                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 2 + line_size)
                    .attr('fill', 'white')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'message-line-3')
                    .attr('display', 'block')
                    .text(messages[7][2]);

                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 2 + line_size * 2)
                    .attr('fill', 'white')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'message-line-4')
                    .attr('display', 'block')
                    .text(messages[7][3]);

                too_slow_time = 300;
                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 2)
                    .attr('fill', 'red')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'too_slow_message')
                    .attr('display', 'none')
                    .text('Move Faster');

                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 2)
                    .attr('fill', 'red')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'inaccurate_message')
                    .attr('display', 'none')
                    .text('Atrocious reach, please try to be better next time.');

                search_too_slow = 3000;
                svgContainer.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', screen_width / 2)
                    .attr('y', screen_height / 3 * 2)
                    .attr('fill', 'white')
                    .attr('font-family', 'san-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'search_too_slow')
                    .attr('display', 'none')
                    .text('To find your cursor, try moving your mouse to the center of the screen.');

                svgContainer.append('text')
                    .attr('text-anchor', 'end')
                    .attr('x', screen_width / 20 * 19)
                    .attr('y', screen_height / 20 * 19)
                    .attr('fill', 'white')
                    .attr('font-family', 'san-serif')
                    .attr('font-size', message_size)
                    .attr('id', 'trialcount')
                    .attr('display', 'none')
                    .text('Reach Number: ' + counter + ' / ' + totalTrials);

                /***************************************
                 * Pointer Lock Variables and Functions *
                 ***************************************/
                document.requestPointerLock = document.requestPointerLock || document.mozRequestPointerLock;
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                document.addEventListener('pointerlockchange', lockChangeAlert, false);
                document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
                window.addEventListener('resize', monitorWindow, false);
                document.addEventListener('click', setPointerLock, false);

                // Function to monitor changes in pointer lock
                function lockChangeAlert() {
                    if (document.pointerLockElement === stage ||
                        document.mozPointerLockElement === stage) {
                        /* console.log('The pointer lock status is now locked'); */
                        document.addEventListener('mousemove', update_cursor, false);
                        document.addEventListener('keydown', advance_block, false);
                    } else {
                        /* console.log('The pointer lock status is now unlocked'); */
                        document.removeEventListener('mousemove', update_cursor, false);
                        document.removeEventListener('keydown', advance_block, false);
                    }
                }

                // Function to set pointer lock and log it
                function setPointerLock() {
                    /* console.log("Attempted to lock pointer"); */
                    stage.requestPointerLock();
                }
                setPointerLock();

                // Function to monitor changes in screen size;
                function monitorWindow(event) {
                    var prev_size = prev_width * prev_height;
                    var curr_size = window.innerHeight * window.innerWidth;
                    /* console.log("prev size: " + prev_size + " curr size: " + curr_size); */
                    /* TODO: bring this back? */
                    /* if (prev_size > curr_size) {
                     *     alert(`Please enter full screen and click your
                       mouse to continue the experiment!(Shortcut
                       for Mac users: Command + Control +
                       F.Shortcut for PC users: F11) `);
                     * } */
                    prev_width = window.innerWidth;
                    prev_height = window.innerHeight;
                    return;
                }

                function show(shown, hidden) {
                    document.getElementById(shown).style.display = 'block';
                    document.getElementById(hidden).style.display = 'none';
                    return false;
                }

                function moveCursor() {
                    var off_x = 0*start_radius;
                    var off_y = 0.5*start_radius + start_radius*2;
                    var flip_x = Math.floor(0.5 * 2);
                    var flip_y = Math.floor(0.5 * 2);
                    if (flip_x) {
                        hand_x = start_x - off_x;
                    } else {
                        hand_x = start_x + off_y;
                    }
                    if (flip_y) {
                        hand_y = start_y - off_y;
                    } else {
                        hand_y = start_y + off_y;
                    }
                }

                function update_cursor(event) {

                    // Record the current mouse movement location
                    event = event || window.event;
                    hand_x += event.movementX;
                    hand_y += event.movementY;

                    // Ensure we do not exceed screen boundaries
                    if (hand_x > screen_width) {
                        hand_x = screen_width;
                    } else if (hand_x < 0) {
                        hand_x = 0;
                    }
                    if (hand_y > screen_height) {
                        hand_y = screen_height;
                    } else if (hand_y < 0) {
                        hand_y = 0;
                    }
                    // Update radius between start and hand location
                    r = Math.sqrt(Math.pow(start_x - hand_x, 2) + Math.pow(start_y - hand_y, 2));

                    // Update hand angle
                    hand_angle = Math.atan2(start_y - hand_y, hand_x - start_x) * 180 / Math.PI;

                    // Calculations done in the MOVING phase
                    if (game_phase == MOVING) {
                        /* Jump target to clamp if target_jump[trial] == 1 */
                        /* Jump target away from clamp by target_jump[trial] if value is neither 0 || 1 */
                        if (target_jump[trial] == 1) {
                            target_x = start_x + target_dist * Math.cos((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                            target_x2 = start_x + target_dist * Math.cos((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                            target_y = start_y - target_dist * Math.sin((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                            d3.select('#target').attr('cx', target_x).attr('cy', target_y).attr('display', 'block');
                            d3.select('#target2').attr('cx', target_x2).attr('cy', target_y).attr('display', 'block');

                        } else if (target_jump[trial] != 0) {
                            target_x = start_x + target_dist * Math.cos((target_angle[trial] + target_jump[trial]) * Math.PI / 180);
                            target_x2 = start_x + target_dist * Math.cos((target_angle[trial] + target_jump[trial]) * Math.PI / 180);
                            target_y = start_y - target_dist * Math.sin((target_angle[trial] + target_jump[trial]) * Math.PI / 180);
                            d3.select('#target').attr('cx', target_x).attr('cy', target_y).attr('display', 'block');
                            d3.select('#target2').attr('cx', target_x2).attr('cy', target_y).attr('display', 'block');

                        }

                        // Updating cursor locations depending on clamp, fb, no_fb
                        if (clamped_fb[trial]) { // Clamped feedback
                            cursor_x = start_x + r * Math.cos((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                            cursor_y = start_y - r * Math.sin((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                        } else if (online_fb[trial]) { // Rotated feedback (vmr)
                            cursor_x = start_x + r * Math.cos((hand_angle + rotation[trial]) * Math.PI / 180);
                            cursor_y = start_y - r * Math.sin((hand_angle + rotation[trial]) * Math.PI / 180);
                        } else { // Veridical feedback
                            cursor_x = hand_x;
                            cursor_y = hand_y;
                        }
                    } else {
                        cursor_x = hand_x;
                        cursor_y = hand_y;
                    }

                    // Calculations done in the HOLDING phase
                    if (game_phase == HOLDING) {
                        if (r <= start_radius) {
                            d3.select('#cursor').attr('display', 'none');
                            d3.select('#start').attr('fill', 'blue');
                        } else {
                            d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
                            d3.select('#start').attr('fill', 'none');
                        }

                        // Calculations done in SHOW_TARTETS phase
                    } else if (game_phase == SHOW_TARGETS) {
                        d3.select('#cursor').attr('display', 'none');
                        d3.select('#start').attr('fill', 'blue');

                        // Flag cursor to display if within certain distance to center
                    } else if (game_phase == SEARCHING) {
                        if (r <= target_dist * 1) {
                            cursor_show = true;
                        }

                        // Display the cursor if flag is on
                        if (cursor_show) {
                            d3.select('#cursor').attr('display', 'block');
                            d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
                        } else {
                            $('html').css('cursor', 'none');
                            $('body').css('cursor', 'none');
                            d3.select('#cursor').attr('display', 'none');
                        }

                        // Displaying the start circle and trial count
                        d3.select('#start').attr('display', 'block');
                        d3.select('#trialcount').attr('display', 'block');

                        // Displaying searching too slow message if threshold is crossed
                        if (new Date() - begin > search_too_slow) {
                            d3.select('#search_too_slow').attr('display', 'block');
                            if (new Date() - begin > search_too_slow + 2000) {
                                // d3.select('#encouragement').attr('display', 'block')
                            }
                        }
                        // Displaying the cursor during MOVING if targetfile indicates so for the reach
                    } else if (game_phase == MOVING) {
                        if (online_fb[trial] || clamped_fb[trial]) {
                            d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
                        } else {
                            d3.select('#cursor').attr('display', 'none'); // hide the cursor
                        }
                    }

                    // Trigger Game Phase Changes that are Dependent on Cursor Movement

                    // Move from search to hold phase if they move within search tolerance of the start circle
                    if (game_phase == SEARCHING && r <= search_tolerance && cursor_show) {
                        d3.select('#search_too_slow').attr('display', 'none');
                        // d3.select('#encouragement').attr('display', 'none');
                        hold_phase();

                        // Move from hold back to search phase if they move back beyond the search tolerance
                    } else if (game_phase == HOLDING && r > search_tolerance) {
                        search_phase();

                        // Start the hold timer if they are within the start circle
                        // Timing flag ensures the timer only gets started once
                    } else if (game_phase == HOLDING && r <= start_radius && !timing) {
                        timing = true;
                        hold_timer = setTimeout(show_targets, hold_time);

                        // Clear out timer if holding is completed
                    } else if (game_phase == HOLDING && r > start_radius && timing) {
                        timing = false;
                        d3.select('#message-line-1').attr('display', 'none');
                        clearTimeout(hold_timer);

                        // Move from show targets to moving phase once user has begun their reach
                    } else if (game_phase == SHOW_TARGETS && r > start_radius && !target_invisible) { // for clicking
                        moving_phase();

                        // Move from moving to feedback phase once their reach intersects the target ring
                    } else if (game_phase == MOVING && r > target_dist) {
                        fb_phase();
                    }
                }

                function search_phase() {
                    game_phase = SEARCHING;
                    console.log('searching')
                    d3.select('#mouse_wiggle_notice').attr('display', 'block')
                    // cursor_show = true;
                    begin = new Date();
                    //nisan
                    if(practice_trial = true){
                        d3.select('#trialcount').attr('display', 'none');
                    }else{
                    d3.select('#trialcount').attr('display', 'block');}

                    d3.select('#start').attr('display', 'block').attr('fill', 'none');
                    d3.select('#target').attr('display', 'none').attr('fill', 'blue');
                    d3.select('#target2').attr('display', 'none').attr('fill', 'blue');
                    d3.select('#cursor').attr('display', 'none');
                    d3.select('#message-line-1').attr('display', 'none');
                    d3.select('#message-line-2').attr('display', 'none');
                    d3.select('#message-line-3').attr('display', 'none');
                    d3.select('#message-line-4').attr('display', 'none');
                    d3.select('#too_slow_message').attr('display', 'none');
                    d3.select('#inaccurate_message').attr('display', 'none');

                }

                function hold_phase() {
                    game_phase = HOLDING;
                    console.log('holding')
                }

                function show_targets() {
                  // NOTE this code adds 4 (for trial 0 -> 3) practice trials right here
                  if (practice_trial[trial] == true){ // practice trials
                    game_phase = SHOW_TARGETS
                    d3.select('#message-line-1').attr('display', 'none');
                    search_time = new Date() - begin;
                    begin = new Date();
                    //nisan
                    d3.select('#trialcount').attr('display', 'none');
                    d3.select('#mouse_wiggle_notice').attr('display', 'none');

                    // d3.select('#target').attr('xlink:href', `img/${img_file[trial]}`)
                    d3.select('#target').attr('xlink:href', `img/blue.png`)
                    target_x = start_x + target_dist * Math.cos(target_angle[trial] * Math.PI / 180);
                    target_y = start_y - target_dist * Math.sin(target_angle[trial] * Math.PI / 180);
                    d3.select('#target').attr('display', 'block').attr('cx', target_x).attr('cy', target_y);
                    target_invisible = false;

                    // d3.select('#target2').attr('xlink:href', `img/${img_file[trial]}`)
                    d3.select('#target2').attr('xlink:href', `img/blue.png`)
                    target_x2 = start_x + target_dist * Math.cos(target_angle[trial] * Math.PI / 180);
                    target_y = start_y - target_dist * Math.sin(target_angle[trial] * Math.PI / 180);
                    d3.select('#target2').attr('display', 'block').attr('cx', target_x2).attr('cy', target_y);
                    target_invisible = false;

                  } else { // main trials
                    game_phase = SHOW_TARGETS;
                    d3.select('#practice_trial_message').attr('display', 'none');
                    search_time = new Date() - begin;
                    begin = new Date();

                    d3.select('#mouse_wiggle_notice').attr('display', 'none');

                    // d3.select('#target').attr('xlink:href', `img/${[trial]}.png`)
                    d3.select('#target').attr('xlink:href', `img/${img_file[trial]}`)
                    // d3.select('#target').attr('xlink:href', `img/orange.png`)
                    target_x = start_x + target_dist * Math.cos(target_angle[trial] * Math.PI / 180);
                    target_y = start_y - target_dist * Math.sin(target_angle[trial] * Math.PI / 180);
                    d3.select('#target').attr('display', 'block').attr('cx', target_x).attr('cy', target_y);
                    target_invisible = false;

                    d3.select('#target2').attr('xlink:href', `img/${img_file[trial]}`)
                    // d3.select('#target2').attr('xlink:href', `img/orange.png`)
                    target_x2 = start_x + target_dist * Math.cos(target_angle[trial] * Math.PI / 180);
                    target_y = start_y - target_dist * Math.sin(target_angle[trial] * Math.PI / 180);
                    d3.select('#target2').attr('display', 'block').attr('cx', target_x2).attr('cy', target_y);
                    target_invisible = false;
                  }
                }


                function moving_phase() {
                    game_phase = MOVING;
                    rt = new Date() - begin;
                    begin = new Date();
                    d3.select('#start').attr('fill', 'none');
                    d3.select('#mouse_wiggle_notice').attr('display', 'none')
                    d3.select('#message-line-1').attr('display', 'none')
                    d3.select('#message-line-2').attr('display', 'none')
                    d3.select('#message-line-3').attr('display', 'none')
                    d3.select('#message-line-4').attr('display', 'none')
                }


                function fb_phase() {
                    game_phase = FEEDBACK;
                    console.log('feedback')
                    // Record movement time as time spent reaching before intersecting target circle
                    // Can choose to add audio in later if necessary
                    mt = new Date() - begin;
                    d3.select('#cursor').attr('display', 'none');
                    d3.select('#feedback_circleR').attr('display', 'none');
                    d3.select('#feedback_circleL').attr('display', 'none');

                    // Note that the below chunk of code (hand_fb_angle calculation) shifted up above these feeback conditionals [Alex 11/02/2023]
                    // Record the hand location immediately after crossing target ring
                    // projected back onto target ring (since mouse doesn't sample fast enough)
                    hand_fb_angle = Math.atan2(start_y - hand_y, hand_x - start_x) * 180 / Math.PI;
                    if (hand_fb_angle < 0) {
                        hand_fb_angle = 360 + hand_fb_angle; // Corrected so that it doesn't have negative angles
                    }
                    hand_fb_x = start_x + target_dist * Math.cos(hand_fb_angle * Math.PI / 180);
                    hand_fb_y = start_y - target_dist * Math.sin(hand_fb_angle * Math.PI / 180);

                    angle_sens = 20;

                    // Tinkering

                    if (mt > too_slow_time) {
                        // d3.select('#target').attr('fill', 'red');
                        if_slow = true;
                        d3.select('#target').attr('display', 'none');
                        d3.select('#target2').attr('display', 'none');
                        d3.select('#cursor').attr('display', 'none');
                        d3.select('#too_slow_message').attr('display', 'block');
                        d3.select('#start').attr('display', 'none');
                        reach_feedback = "too_slow";

                    } else if (cursor_x < start_x) {
                        participant_category_resp = "A"
                            if (hand_fb_angle > angle_sens && hand_fb_angle < (180 - angle_sens)) {
                                reach_feedback = "inaccurate_reach";
                                inaccurate_reach_message();
                            } else if (hand_fb_angle > (180 + angle_sens) && hand_fb_angle < (360 - angle_sens)) {
                                reach_feedback = "inaccurate_reach";
                                inaccurate_reach_message();
                            } else if (correct_resp[trial] == 1) {
                                reach_feedback = "good_reach";
                                d3.select('#feedback_circleL').attr('display', 'block').attr('stroke', 'green');
                            } else if (correct_resp[trial] == 2){
                                reach_feedback = "good_reach";
                                d3.select('#feedback_circleL').attr('display', 'block').attr('stroke', 'red');
                            }
                    } else if (cursor_x > start_x) {
                        participant_category_resp = "B"
                          if (hand_fb_angle > angle_sens && hand_fb_angle < (180 - angle_sens)) {
                              reach_feedback = "inaccurate_reach";
                              inaccurate_reach_message();
                          } else if (hand_fb_angle > (180 + angle_sens) && hand_fb_angle < (360 - angle_sens)) {
                              reach_feedback = "inaccurate_reach";
                              inaccurate_reach_message();
                          } else if (correct_resp[trial] == 1) {
                              reach_feedback = "good_reach";
                              d3.select('#feedback_circleR').attr('display', 'block').attr('stroke', 'red');
                          } else if (correct_resp[trial] == 2){
                              reach_feedback = "good_reach";
                              d3.select('#feedback_circleR').attr('display', 'block').attr('stroke', 'green');
                          }
                    }

                    function inaccurate_reach_message() {
                        d3.select('#target').attr('display', 'none');
                        d3.select('#target2').attr('display', 'none');
                        d3.select('#cursor').attr('display', 'none');
                        d3.select('#inaccurate_message').attr('display', 'block');
                        d3.select('#start').attr('display', 'none');
                    }

                    // if (mt > too_slow_time) {
                    //     // d3.select('#target').attr('fill', 'red');
                    //     if_slow = true;
                    //     d3.select('#target').attr('display', 'none');
                    //     d3.select('#target2').attr('display', 'none');
                    //     d3.select('#cursor').attr('display', 'none');
                    //     d3.select('#too_slow_message').attr('display', 'block');
                    //     d3.select('#start').attr('display', 'none');
                    //     reach_feedback = "too_slow";
                    // // } else {
                    // //     reach_feedback = "good_reach";
                    // // }
                    // // d3.select('#target').attr('fill', 'green');
                    // } else if (hand_fb_angle > angle_sens && hand_fb_angle < (180 - angle_sens)) {
                    //       d3.select('#target').attr('display', 'none');
                    //       d3.select('#target2').attr('display', 'none');
                    //       d3.select('#cursor').attr('display', 'none');
                    //       d3.select('#inaccurate_message').attr('display', 'block');
                    //       d3.select('#start').attr('display', 'none');
                    //       reach_feedback = "inaccurate_reach";
                    //       participant_category_resp = null;
                    // } else if (hand_fb_angle > (180 + angle_sens) && hand_fb_angle < (360 - angle_sens)) {
                    //       d3.select('#target').attr('display', 'none');
                    //       d3.select('#target2').attr('display', 'none');
                    //       d3.select('#cursor').attr('display', 'none');
                    //       d3.select('#inaccurate_message').attr('display', 'block');
                    //       d3.select('#start').attr('display', 'none');
                    //       reach_feedback = "inaccurate_reach";
                    //       participant_category_resp = null;
                    // } else if (correct_resp[trial] === 1 && cursor_x < start_x) {
                    //      reach_feedback = "good_reach";
                    //      d3.select('#feedback_circleL').attr('display', 'block').attr('stroke', 'green');
                    //      participant_category_resp = "A";
                    // } else if (correct_resp[trial] === 1 && cursor_x > start_x) {
                    //      reach_feedback = "good_reach";
                    //      d3.select('#feedback_circleR').attr('display', 'block').attr('stroke', 'red');
                    //      participant_category_resp = "B";
                    // } else if (correct_resp[trial] === 2 && cursor_x > start_x) {
                    //       reach_feedback = "good_reach";
                    //       d3.select('#feedback_circleR').attr('display', 'block').attr('stroke', 'green');
                    //       participant_category_resp = "B";
                    // } else if (correct_resp[trial] === 2 && cursor_x < start_x) {
                    //       reach_feedback = "good_reach";
                    //       d3.select('#feedback_circleL').attr('display', 'block').attr('stroke', 'red');
                    //       participant_category_resp = "A";
                    // }

                    // hand_fb_angle calculation code taken from here [Alex 11/02/2023]

                    // console log of Hnd_fb_angle for scoring system troubleshooting
                    console.log('HAND FEEDBACK ANGLE ' + hand_fb_angle + ', for reach: ' + counter);


                    // Display Cursor Endpoint Feedback
                    if (clamped_fb[trial]) { // Clamped feedback
                        cursor_x = start_x + target_dist * Math.cos((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                        cursor_y = start_y - target_dist * Math.sin((target_angle[trial] + rotation[trial]) * Math.PI / 180);
                        d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
                        trial_type = "clamped_fb";
                    } else if (endpt_fb[trial] || online_fb[trial]) { // Visible feedback (may be rotated depending on rotation)
                        cursor_x = start_x + target_dist * Math.cos((hand_fb_angle + rotation[trial]) * Math.PI / 180);
                        cursor_y = start_y - target_dist * Math.sin((hand_fb_angle + rotation[trial]) * Math.PI / 180);
                        d3.select('#cursor').attr('cx', cursor_x).attr('cy', cursor_y).attr('display', 'block');
                        trial_type = "online_fb";
                    } else {
                        d3.select('#cursor').attr('display', 'none');
                        trial_type = "no_fb";
                    }
                    // Start next trial after feedback time has elapsed
                    if (if_slow) {
                        if_slow = false;
                        fb_timer = setTimeout(next_trial, feedback_time_slow);
                    } else {
                        fb_timer = setTimeout(next_trial, feedback_time);
                    }
                }

                function next_trial() {
                    var d = new Date();
                    var current_date = (parseInt(d.getMonth()) +
                            1).toString() + "/" + d.getDate() + "/" +
                        d.getFullYear() + " " + d.getHours() + ":" +
                        d.getMinutes() + "." + d.getSeconds() + "." +
                        d.getMilliseconds();

                    cursor_show = false;

                    // Uploading reach data for this reach onto the database
                    //SubjTrials.group_type is defined in startGame
                    subjTrials.experimentID = experiment_ID;
                    subjTrials.id = subject.id;
                    subjTrials.currentDate.push(current_date);
                    subjTrials.trialNum.push(trial + 1);
                    subjTrials.target_angle.push(target_angle[trial]);
                    subjTrials.trial_type.push(trial_type);
                    subjTrials.rotation.push(rotation[trial]);
                    subjTrials.hand_fb_angle.push(hand_fb_angle);
                    subjTrials.rt.push(rt);
                    subjTrials.mt.push(mt);
                    subjTrials.search_time.push(search_time);
                    subjTrials.reach_feedback.push(reach_feedback);
                    subjTrials.participant_category_resp.push(participant_category_resp);
                    subjTrials.practice_trial.push(practice_trial);

                    console.log(subjTrials)

                    // Updating subject data to display most recent reach on database
                    subject.currTrial = trial + 1;

                    // Reset timing variables
                    rt = 0;
                    mt = 0;
                    search_time = 0;

                    // Between Blocks Message Index
                    bb_mess = between_blocks[trial];

                    // Increment the trial count
                    trial += 1;
                    counter += 1;
                    if (practice_trial[trial] == true){
                    } else{
                      d3.select('#trialcount').text('Reach Number: ' + counter + ' / ' + totalTrials);}

                    // Ensure target, cursor invisible

                    d3.select('#target').attr('display', 'none');
                    d3.select('#target2').attr('display', 'none');
                    d3.select('#cursor').attr('display', 'none');
                    d3.select('#feedback_circleL').attr('display', 'none')
                    d3.select('#feedback_circleR').attr('display', 'none')
                    d3.select('#mouse_wiggle_notice').attr('display', 'block')

                    target_invisible = true; // for clicking, currently not employed

                    // Teleport cursor back to center
                    setTimeout(moveCursor, 0);

                    // Checks whether the experiment is complete, if not continues to next trial
                    console.log(trial);
                    console.log(num_trials);
                    if (trial == num_trials[0]) {
                        window.removeEventListener('resize', monitorWindow, false);
                        document.removeEventListener('click', setPointerLock, false);
                        document.exitPointerLock();
                        endGame();
                    // } else if (bb_mess || counter == 1 && (instr_counter == 0 && practice_trial == true && trialnum == -1)) {
                    //     game_phase = BETWEEN_BLOCKS;
                    //     console.log('bb practice slide 2')
                    //     d3.select('#message-line-1').attr('display', 'block').text(messages[8][0]); // need to make sure these aren't a hack job later
                    //     d3.select('#message-line-2').attr('display', 'block').text(messages[8][1]);
                    //     d3.select('#message-line-3').attr('display', 'block').text(messages[8][2]);
                    //     d3.select('#message-line-4').attr('display', 'block').text(messages[8][3]);
                    //     d3.select('#target2').attr('xlink:href', `img/0_practice.png`).attr('display', 'block');
                    //
                    //     d3.select('#mouse_wiggle_notice').attr('display', 'none')
                    //     d3.select('#too_slow_message').attr('display', 'none');
                    //     d3.select('#trialcount').attr('display', 'block');
                    //     d3.select('#start').attr('display', 'none');
                    // } else if (bb_mess || counter == 1 && (instr_counter == 1 && practice_trial == true && trialnum == -2)) {
                    //     game_phase = BETWEEN_BLOCKS;
                    //     console.log('bb practice slide 3')
                    //     d3.select('#message-line-1').attr('display', 'block').text(messages[9][0]); // need to make sure these aren't a hack job later
                    //     d3.select('#message-line-2').attr('display', 'block').text(messages[9][1]);
                    //     d3.select('#message-line-3').attr('display', 'block').text(messages[9][2]);
                    //     d3.select('#message-line-4').attr('display', 'block').text(messages[9][3]);
                    //     d3.select('#target2').attr('xlnk:href', `img/orange.png`).attr('display', 'block')
                    //
                    //     d3.select('#mouse_wiggle_notice').attr('display', 'none')
                    //     d3.select('#too_slow_message').attr('display', 'none');
                    //     d3.select('#trialcount').attr('display', 'block');
                    //     d3.select('#start').attr('display', 'none');
                    } else if (bb_mess) {
                        game_phase = BETWEEN_BLOCKS;
                        instr_counter += 1;

                        d3.select('#message-line-1').attr('display', 'block').text(messages[bb_mess][0]);
                        d3.select('#message-line-2').attr('display', 'block').text(messages[bb_mess][1]);
                        d3.select('#message-line-3').attr('display', 'block').text(messages[bb_mess][2]);
                        d3.select('#message-line-4').attr('display', 'block').text(messages[bb_mess][3]);
                        d3.select('#mouse_wiggle_notice').attr('display', 'none')
                        d3.select('#too_slow_message').attr('display', 'none');
                        d3.select('#inaccurate_message').attr('display', 'none');
                        //nisan
                        d3.select('#trialcount').attr('display', 'none');
                        d3.select('#start').attr('display', 'none');
                        console.log('CANT WAKE UP')
                    } else {
                        // Start next trial
                        search_phase();
                    }
                }

                function advance_block(event) {
                  	var SPACE_BAR = 32;
                  	var a = 65;
                  	var e = 69;
                  	var b = 66;
                  	var f = 70;
                    var arrow_fwd = 39;
                  	// var esc = 27;
                  	// var tilde = 176;
                  	var caps = 20;
                  	// bb_mess 1 --> b, 2 or 5 --> a, 3 or 6 --> space, 4 --> e
                  	if (event.keyCode == caps) {
                      	console.log("premature end");
                      	console.log(bb_mess);
                      	window.removeEventListener('resize', monitorWindow, false);
                      	document.removeEventListener('click', setPointerLock, false);
                      	document.exitPointerLock();
                      	badGame(); // Premature exit game if failed attention check
                  	} else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 0) && event.keyCode == f) {
                        instruction_phase_slide_2();
                    } else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 1) && event.keyCode == a) {
                        instruction_phase_slide_3();
                    } else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 2) && event.keyCode == b) {
                        instruction_phase_slide_4();
                    } else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 3) && event.keyCode == SPACE_BAR) {
                        search_phase();
                    } else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 4) && event.keyCode == SPACE_BAR) {
                        instruction_phase_slide_5();
                    } else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 5) && event.keyCode == SPACE_BAR) {
                        search_phase();
                    } else if ((game_phase == BETWEEN_BLOCKS && instr_counter == 6) && event.keyCode == SPACE_BAR) {
                        search_phase();
                    } else if (practice_trial == false && ((game_phase == BETWEEN_BLOCKS && (bb_mess == 5 || bb_mess == 2) && event.keyCode == a) || bb_mess == 0)) {
                      	search_phase();
                  	} else if (practice_trial == false && ((game_phase == BETWEEN_BLOCKS && bb_mess == 4 && event.keyCode == e))) {
                      	search_phase();
                  	} else if (practice_trial == false && (game_phase == BETWEEN_BLOCKS && bb_mess == 1 && event.keyCode == b)) {
                      	search_phase();
                  	} else if (practice_trial == false && (game_phase == BETWEEN_BLOCKS && event.keyCode == SPACE_BAR && (bb_mess == 3 || bb_mess == 6))) {
                      	search_phase();
                  	} else if (game_phase != BETWEEN_BLOCKS) {
                      	// Do nothing
                  	} else {
                      	d3.select('#message-line-1').attr('display', 'block').text('Invalid Key');
                  	}
              	}

                function instruction_phase_slide_2 () {
                  game_phase == BETWEEN_BLOCKS;
                  instr_counter += 1;

                  trial_type = "practice";
                  reach_feedback = "practice";

                  console.log('bb practice slide 2')
                  console.log(instr_counter)
                  d3.select('#message-line-1').attr('display', 'block').text(messages[8][0]); // need to make sure these aren't a hack job later
                  d3.select('#message-line-2').attr('display', 'block').text(messages[8][1]);
                  d3.select('#message-line-3').attr('display', 'block').text(messages[8][2]);
                  d3.select('#message-line-4').attr('display', 'block').text(messages[8][3]);
                  d3.select('#target2').attr('xlink:href', `img/0_practice.png`).attr('display', 'block');

                  d3.select('#mouse_wiggle_notice').attr('display', 'none')
                  d3.select('#too_slow_message').attr('display', 'none');
                  d3.select('#inaccurate_message').attr('display', 'none');
                  //nisan
                  d3.select('#trialcount').attr('display', 'none');
                  d3.select('#start').attr('display', 'none');

                  counter = 1;
                }

                function instruction_phase_slide_3 () {
                  game_phase == BETWEEN_BLOCKS;
                  instr_counter += 1;

                  trial_type = "practice";
                  reach_feedback = "practice";

                  console.log('bb practice slide 3')
                  console.log(instr_counter)
                  d3.select('#message-line-1').attr('display', 'block').text(messages[9][0]); // need to make sure these aren't a hack job later
                  d3.select('#message-line-2').attr('display', 'block').text(messages[9][1]);
                  d3.select('#message-line-3').attr('display', 'block').text(messages[9][2]);
                  d3.select('#message-line-4').attr('display', 'block').text(messages[9][3]);
                  d3.select('#target2').attr('xlink:href', `img/0_practice.png`).attr('display', 'block');

                  d3.select('#mouse_wiggle_notice').attr('display', 'none')
                  d3.select('#too_slow_message').attr('display', 'none');
                  d3.select('#inaccurate_message').attr('display', 'none');
                  //nisan
                  d3.select('#trialcount').attr('display', 'none');
                  d3.select('#start').attr('display', 'none');

                  counter = 1;
                }

                function instruction_phase_slide_4 () {
                  game_phase == BETWEEN_BLOCKS;
                  instr_counter += 1;

                  trial_type = "practice";
                  reach_feedback = "practice";

                  console.log('bb practice slide 4')
                  console.log(instr_counter)
                  d3.select('#message-line-1').attr('display', 'block').text(messages[10][0]); // need to make sure these aren't a hack job later
                  d3.select('#message-line-2').attr('display', 'block').text(messages[10][1]);
                  d3.select('#message-line-3').attr('display', 'block').text(messages[10][2]);
                  d3.select('#message-line-4').attr('display', 'block').text(messages[10][3]);
                  d3.select('#target2').attr('xlink:href', `img/0_practice.png`).attr('display', 'block');

                  d3.select('#mouse_wiggle_notice').attr('display', 'none')
                  d3.select('#too_slow_message').attr('display', 'none');
                  d3.select('#inaccurate_message').attr('display', 'none');
                  //nisan
                  d3.select('#trialcount').attr('display', 'none');
                  d3.select('#start').attr('display', 'none');

                  counter = 1;
                }

                function instruction_phase_slide_5 () {
                  game_phase == BETWEEN_BLOCKS;
                  instr_counter += 1;

                  trial_type = "practice";
                  reach_feedback = "practice";

                  console.log('bb practice slide 5')
                  console.log(instr_counter)
                  d3.select('#message-line-1').attr('display', 'block').text(messages[0][0]); // need to make sure these aren't a hack job later
                  d3.select('#message-line-2').attr('display', 'block').text(messages[0][1]);
                  d3.select('#message-line-3').attr('display', 'block').text(messages[0][2]);
                  d3.select('#message-line-4').attr('display', 'block').text(messages[0][3]);
                  d3.select('#target2').attr('xlink:href', `img/0_practice.png`).attr('display', 'block');

                  d3.select('#mouse_wiggle_notice').attr('display', 'none')
                  d3.select('#too_slow_message').attr('display', 'none');
                  d3.select('#inaccurate_message').attr('display', 'none');
                  //nisan
                  d3.select('#trialcount').attr('display', 'none');
                  d3.select('#start').attr('display', 'none');
                }

                // Function used to enter full screen mode
                function openFullScreen() {
                    elem = document.getElementById('container-info');
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                        console.log("enter1")
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                        console.log("enter2")
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                        console.log("enter3")
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                        console.log("enter4")
                    }
                }

                // Function used to exit full screen mode
                function closeFullScreen() {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }

                function helpEnd() {
                    closeFullScreen();
                    $('html').css('cursor', 'auto');
                    $('body').css('cursor', 'auto');
                    $('body').css('background-color', 'white');
                    $('html').css('background-color', 'white');

                    d3.select('#start').attr('display', 'none');
                    d3.select('#target').attr('display', 'none');
                    d3.select('#target2').attr('display', 'none');
                    d3.select('#cursor').attr('display', 'none');
                    d3.select('#message-line-1').attr('display', 'none');
                    d3.select('#message-line-2').attr('display', 'none');
                    d3.select('#message-line-3').attr('display', 'none');
                    d3.select('#message-line-4').attr('display', 'none');
                    d3.select('#too_slow_message').attr('display', 'none');
                    d3.select('#inaccurate_message').attr('display', 'none');
                    d3.select('#search_too_slow').attr('display', 'none');
                    d3.select('#countdown').attr('display', 'none');
                    d3.select('#trialcount').attr('display', 'none');

                    console.log('done')

                    /* recordTrialSubj(trialcollection, subjTrials); */
                }

                function badGame() {
                    helpEnd();
                    /* show('container-failed', 'container-exp'); */
                }

                function endGame() {
                    helpEnd();
                    /* show('container-not-an-ad', 'container-exp'); */
                    console.log(subjTrials)
                }

                function saveFeedback() {
                    var values = $("#feedbackForm").serializeArray();
                    if (values[0].value != "") {
                        subject.comments = values[0].value;
                    }
                    values = $("#distractionForm").serializeArray();
                    var i;
                    for (i = 0; i < values.length; i++) {
                        subject.distractions.push(values[i].value);
                        if (values[i].value == "other") {
                            subject.distracto = values[i + 1].value;
                            break;
                        }
                    }

                    /* createSubject(subjectcollection, subject); */
                    /* show('final-page', 'container-not-an-ad'); */

                }
            })
        }
    };


    /* create timeline */
    var timeline = [];

    /* init connection with pavlovia.org */
    var pavlovia_init = {
        /* type: "pavlovia", */
        type: jsPsychPavlovia,
        command: "init"
    };

    /* finish connection with pavlovia.org */
    var pavlovia_finish = {
        /* type: "pavlovia", */
        type: jsPsychPavlovia,
        command: "finish"
    };


    var procedure = {
        timeline: [trial],
        on_timeline_finish: function() {
            console.log('This timeline has finished.');
           // timeline.push(pavlovia_finish);
        }
    }

   // timeline.push(pavlovia_init);
   timeline.push(procedure);

   jsPsych.run(timeline);
