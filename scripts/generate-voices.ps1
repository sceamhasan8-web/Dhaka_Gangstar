# generate-voices.ps1 - Automated Speech Synthesis for Dhaka City Gangstar Voice Assets
Add-Type -AssemblyName System.Speech

Write-Host "=== STARTING AUTOMATED VOICE ASSET GENERATION ==="

$baseDir = Join-Path $PSScriptRoot "..\public\audio\voices"
$dirs = @(
    "player",
    "pedestrians",
    "vendors",
    "police",
    "missions",
    "tutorial"
)

foreach ($d in $dirs) {
    $target = Join-Path $baseDir $d
    if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
    }
}

# Voice Asset Catalog with Dialogue Scripts and Voice Parameters
$voiceManifest = @(
    # --- PLAYER CHARACTER VOICES (MALE & FEMALE) ---
    @{
        Folder = "player"
        File = "player_jump_male.wav"
        Text = "Hup!"
        Voice = "Male"
        Rate = 3
        Pitch = 1
    },
    @{
        Folder = "player"
        File = "player_land_male.wav"
        Text = "Oof!"
        Voice = "Male"
        Rate = 2
        Pitch = -1
    },
    @{
        Folder = "player"
        File = "player_pain_male.wav"
        Text = "Ah! Damn it!"
        Voice = "Male"
        Rate = 2
        Pitch = 0
    },
    @{
        Folder = "player"
        File = "player_victory_male.wav"
        Text = "Dhaka city is mine! Done deal!"
        Voice = "Male"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "player"
        File = "player_car_male.wav"
        Text = "Let's roll through Dhaka!"
        Voice = "Male"
        Rate = 1
        Pitch = 0
    },
    @{
        Folder = "player"
        File = "player_jump_female.wav"
        Text = "Hop!"
        Voice = "Female"
        Rate = 3
        Pitch = 2
    },
    @{
        Folder = "player"
        File = "player_land_female.wav"
        Text = "Ah!"
        Voice = "Female"
        Rate = 2
        Pitch = 0
    },
    @{
        Folder = "player"
        File = "player_pain_female.wav"
        Text = "Ouch! Watch it!"
        Voice = "Female"
        Rate = 2
        Pitch = 1
    },
    @{
        Folder = "player"
        File = "player_victory_female.wav"
        Text = "Too easy for me! Mission cleared!"
        Voice = "Female"
        Rate = 1
        Pitch = 2
    },

    # --- PEDESTRIAN CONVERSATIONS & STREET REACTIONS ---
    @{
        Folder = "pedestrians"
        File = "ped_greet_1.wav"
        Text = "Assalamu alaikum brother! Where are you headed today?"
        Voice = "Male"
        Rate = 0
        Pitch = 0
    },
    @{
        Folder = "pedestrians"
        File = "ped_greet_2.wav"
        Text = "Hello friend! Beautiful afternoon in the city."
        Voice = "Female"
        Rate = 0
        Pitch = 1
    },
    @{
        Folder = "pedestrians"
        File = "ped_traffic_react_1.wav"
        Text = "Hey! Watch where you are driving! Look at the road!"
        Voice = "Male"
        Rate = 2
        Pitch = 2
    },
    @{
        Folder = "pedestrians"
        File = "ped_traffic_react_2.wav"
        Text = "Crazy driver! Slow down or you will cause an accident!"
        Voice = "Female"
        Rate = 2
        Pitch = 1
    },
    @{
        Folder = "pedestrians"
        File = "ped_chat_jam.wav"
        Text = "Did you see the traffic jam at Motijheel today? Absolutely massive!"
        Voice = "Male"
        Rate = 0
        Pitch = -1
    },
    @{
        Folder = "pedestrians"
        File = "ped_chat_metro.wav"
        Text = "The new Metro Rail is incredible! Farmgate to Uttara in only fifteen minutes!"
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "pedestrians"
        File = "ped_rickshaw_puller.wav"
        Text = "Brother, do you need a rickshaw? Best ride in town!"
        Voice = "Male"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "pedestrians"
        File = "ped_gangstar_salute.wav"
        Text = "Greetings to the boss of Dhaka City! Respect!"
        Voice = "Male"
        Rate = 0
        Pitch = -2
    },

    # --- SHOPKEEPERS & STREET VENDORS ---
    @{
        Folder = "vendors"
        File = "vendor_tea_stall.wav"
        Text = "Brother, come take a cup of hot milk tea! Fresh and steaming!"
        Voice = "Male"
        Rate = 1
        Pitch = 0
    },
    @{
        Folder = "vendors"
        File = "vendor_biryani_stall.wav"
        Text = "Old Dhaka Haji Biryani! Best spiced mutton and basmati rice in town!"
        Voice = "Male"
        Rate = 0
        Pitch = -1
    },

    # --- POLICE DISPATCH & MEGAPHONE COMMUNICATION ---
    @{
        Folder = "police"
        File = "police_dispatch_alert.wav"
        Text = "Attention all units! Suspect spotted fleeing reckless in Dhaka central sector. Intercept immediately!"
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "police"
        File = "police_warning_halt.wav"
        Text = "Pull over your vehicle immediately and step out with your hands up!"
        Voice = "Male"
        Rate = 1
        Pitch = 0
    },
    @{
        Folder = "police"
        File = "police_pursuit_backup.wav"
        Text = "Dispatch, suspect is driving aggressively! Deploy roadblocks on the main avenue!"
        Voice = "Male"
        Rate = 2
        Pitch = 1
    },
    @{
        Folder = "police"
        File = "police_stand_down.wav"
        Text = "All units, suspect has broken line of sight. Stand down code four."
        Voice = "Female"
        Rate = 0
        Pitch = 0
    },

    # --- MISSION ANNOUNCEMENTS & NARRATION ---
    @{
        Folder = "missions"
        File = "mission_start_biryani.wav"
        Text = "Mission briefing. Pick up fresh Haji Biryani from Old Dhaka and rush it to Motijheel Bank Tower before the corporate lunch closes!"
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "missions"
        File = "mission_start_hatirjheel.wav"
        Text = "Challenge active. Hatirjheel midnight drift! Floor the gas and clear the bridge checkpoints before time runs out!"
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "missions"
        File = "mission_start_sadarghat.wav"
        Text = "Gangstar heist. Retrieve the secret contraband briefcase dropped at Sadarghat terminal and escape safely!"
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "missions"
        File = "mission_start_curzon.wav"
        Text = "Courier mission. Secure historical classified documents and transport them to the Curzon Hall pavilion."
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "missions"
        File = "mission_start_parliament.wav"
        Text = "VIP Escort. Navigate the executive motorcade safely to the National Parliament South Plaza."
        Voice = "Female"
        Rate = 1
        Pitch = 1
    },
    @{
        Folder = "missions"
        File = "mission_time_warning.wav"
        Text = "Warning! Thirty seconds remaining on the clock! Step on it!"
        Voice = "Female"
        Rate = 2
        Pitch = 2
    },
    @{
        Folder = "missions"
        File = "mission_complete_voice.wav"
        Text = "Objective completed successfully! Excellent driving! Cash reward transferred."
        Voice = "Female"
        Rate = 1
        Pitch = 2
    },
    @{
        Folder = "missions"
        File = "mission_failed_voice.wav"
        Text = "Mission failed! You ran out of time. Regroup and try again."
        Voice = "Female"
        Rate = 0
        Pitch = -1
    },

    # --- TUTORIAL & SYSTEM GUIDANCE ---
    @{
        Folder = "tutorial"
        File = "tutorial_welcome.wav"
        Text = "Welcome to Dhaka City Gangstar! Use WASD to move, hold shift to sprint, and press E to drive vehicles."
        Voice = "Female"
        Rate = 1
        Pitch = 1
    }
)

$count = 0
foreach ($item in $voiceManifest) {
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    
    # Select voice gender
    $installed = $synth.GetInstalledVoices()
    $selectedVoice = $null
    foreach ($v in $installed) {
        if ($item.Voice -eq "Female" -and $v.VoiceInfo.Gender -eq [System.Speech.Synthesis.VoiceGender]::Female) {
            $selectedVoice = $v.VoiceInfo.Name
            break
        }
        if ($item.Voice -eq "Male" -and $v.VoiceInfo.Gender -eq [System.Speech.Synthesis.VoiceGender]::Male) {
            $selectedVoice = $v.VoiceInfo.Name
            break
        }
    }
    if ($selectedVoice) {
        $synth.SelectVoice($selectedVoice)
    }

    $synth.Rate = $item.Rate
    $filePath = Join-Path (Join-Path $baseDir $item.Folder) $item.File

    # Set output to WAV file
    $synth.SetOutputToWaveFile($filePath)
    $synth.Speak($item.Text)
    $synth.Dispose()

    if (Test-Path $filePath) {
        $count++
        Write-Host "Generated: $($item.Folder)/$($item.File) - '$($item.Text.Substring(0, [Math]::Min(35, $item.Text.Length)))...'"
    }
}

Write-Host "=== TOTAL VOICE ASSETS GENERATED: $count ==="
