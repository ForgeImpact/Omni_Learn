// src/components/content/AdaptiveContent.js (continued)

  // Render appropriate content component based on content type
  const renderContent = () => {
    switch (content.contentType) {
      case 'video':
        return (
          <VideoPlayer
            videoUrl={content.mediaUrl}
            quality={contentQuality}
            captions={content.captions}
            onComplete={handleContentComplete}
          />
        );
      case 'simulation':
        return (
          <InteractiveSimulation
            simulationData={content.simulationData}
            quality={contentQuality}
            supportedInteractions={content.supportedInteractions}
            onComplete={handleContentComplete}
          />
        );
      case 'text':
        return (
          <TextContent
            content={content.textContent}
            hasAudio={content.hasAudio}
            audioUrl={content.audioUrl}
            onComplete={handleContentComplete}
          />
        );
      case 'audio':
        return (
          <AudioContent
            audioUrl={content.audioUrl}
            transcript={content.transcript}
            visualizations={content.visualizations}
            onComplete={handleContentComplete}
          />
        );
      case 'quiz':
        return (
          <QuizComponent
            questions={content.questions}
            adaptiveQuestions={content.adaptiveQuestions}
            onComplete={handleContentComplete}
          />
        );
      case 'ar':
        return (
          <ARExperience
            arContent={content.arContent}
            fallbackContent={content.fallbackContent}
            onComplete={handleContentComplete}
          />
        );
      default:
        return <div className="content-error">Unknown content type</div>;
    }
  };

  return (
    <div className="adaptive-content">
      <h2>{content.title}</h2>
      {content.description && <p className="content-description">{content.description}</p>}
      <div className="content-container">
        {renderContent()}
      </div>
    </div>
  );
};

AdaptiveContent.propTypes = {
  moduleId: PropTypes.string.isRequired,
  onContentLoad: PropTypes.func,
  onContentError: PropTypes.func,
  onContentComplete: PropTypes.func
};

export default AdaptiveContent;
