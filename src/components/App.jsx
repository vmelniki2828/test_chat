import { LiquidHeroScene } from 'components/LiquidHeroScene';
import { HorizontalScrollSection } from 'components/HorizontalScrollSection';
import { ScrollRevealBlocks } from 'components/ScrollRevealBlocks';
import { PinnedStorytellingSection } from 'components/PinnedStorytellingSection';

export const App = () => {
  return (
    <>
      <LiquidHeroScene />
      <div id="reveal-blocks">
        <ScrollRevealBlocks />
      </div>
      <div id="horizontal-flow">
        <HorizontalScrollSection />
      </div>
      <div id="story-steps">
        <PinnedStorytellingSection />
      </div>
    </>
  );
};
