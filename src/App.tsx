import { useEffect } from 'react';
import Timeline from './components/Timeline';
import KofiButton from './components/KofiButton';

function App() {
  //const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    document.getElementById('root')?.setAttribute('data-react-mounted', 'true');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-inter">
      <Timeline />
      <KofiButton isVisible={false} />
    </div>
  );
}

export default App;
