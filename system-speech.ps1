param([Parameter(Mandatory=$true)][string]$TextBase64,[ValidateSet('ru','it')][string]$Language,[int]$Rate=-1)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
$stream=New-Object System.IO.MemoryStream
try {
 $voice=$speaker.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq $Language } | Select-Object -First 1
 if(-not $voice){throw 'No matching system voice'}
 $speaker.SelectVoice($voice.VoiceInfo.Name)
 $speaker.Rate=$Rate
 $speaker.SetOutputToWaveStream($stream)
 $speaker.Speak([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($TextBase64)))
 $speaker.SetOutputToNull()
 [Console]::Out.Write([Convert]::ToBase64String($stream.ToArray()))
} finally { $speaker.Dispose();$stream.Dispose() }
