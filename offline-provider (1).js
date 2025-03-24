// Helper function to remove download status
  const removeDownloadStatus = async (userId, courseId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Check if a specific course is available offline
  const isCourseAvailableOffline = (courseId) => {
    return offlineAvailableCourses.some(course => course.id === courseId);
  };

  // Check if user has any pending syncs
  const hasPendingSyncs = () => {
    return pendingSyncs.length > 0;
  };

  // Get download status for a specific course
  const getCourseDownloadStatus = (courseId) => {
    return offlineDownloads[courseId] || { status: 'not-downloaded', progress: 0 };
  };

  // Force sync with server when online
  const forceSyncWithServer = async () => {
    if (!isOnline || !currentUser) {
      return { success: false, message: 'Cannot sync while offline' };
    }

    try {
      for (const syncOp of pendingSyncs) {
        await processSyncOperation(syncOp, currentUser.uid);
      }
      
      await clearPendingSyncs(currentUser.uid);
      setPendingSyncs([]);
      
      return { success: true, message: 'Sync completed successfully' };
    } catch (error) {
      console.error('Error during forced sync:', error);
      return { success: false, message: error.message || 'Unknown error during sync' };
    }
  };

  // Get estimated storage usage
  const getStorageUsage = async () => {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { used: 0, quota: 0, percentage: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota === 0 ? 0 : Math.round((used / quota) * 100);
      
      return { used, quota, percentage };
    } catch (error) {
      console.error('Error estimating storage:', error);
      return { used: 0, quota: 0, percentage: 0 };
    }
  };

  const value = {
    isOnline,
    offlineAvailableCourses,
    offlineDownloads,
    pendingSyncs,
    downloadCourseForOffline,
    removeCourseFromOffline,
    trackOfflineProgress,
    isCourseAvailableOffline,
    hasPendingSyncs,
    getCourseDownloadStatus,
    forceSyncWithServer,
    getStorageUsage
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}
