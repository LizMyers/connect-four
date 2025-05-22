class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;

  private constructor() {
    console.log("SoundManager initialized");
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(soundName: string): void {
    if (!this.enabled) return;
    
    try {
      console.log(`Attempting to play sound: ${soundName}`);
      
      // Use the pre-defined audio elements in index.html
      // Convert 'drop' to 'drop-sound', 'win' to 'win-sound'
      const audioElementId = `${soundName}-sound`;
      console.log(`Looking for audio element with ID: ${audioElementId}`);
      
      const audioElement = document.getElementById(audioElementId) as HTMLAudioElement;
      
      if (audioElement) {
        console.log(`Found audio element: ${audioElementId}`);
        // Reset the audio to ensure it plays
        audioElement.currentTime = 0;
        audioElement.volume = 0.7;
        
        // Play with a user interaction safety check
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn(`Sound play error (${soundName}):`, error);
          });
        }
      } else {
        console.error(`Sound element not found: ${audioElementId}. Available elements:`, 
          Array.from(document.getElementsByTagName('audio')).map(el => el.id).join(', '));
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }

  public toggleSound(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`Sound ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export default SoundManager.getInstance(); 