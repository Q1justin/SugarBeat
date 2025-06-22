const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, { 
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true 
  });
};

export {
    formatTime,
}
