function DocumentsLoader() {
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <span className="loading loading-infinity loading-xl text-primary mb-4"></span>
      <p className="text-base-content/60">Loading your documents...</p>
    </div>
  );
}

export default DocumentsLoader;
