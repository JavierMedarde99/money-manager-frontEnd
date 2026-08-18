function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-bounce-in">
        <h1 className="text-5xl font-bold text-primary mb-4">Money Manager</h1>
        <p className="text-muted-foreground text-lg">Candy Theme Configurado</p>
        <div className="flex gap-3 justify-center mt-6">
          <div className="h-10 w-10 rounded-full bg-primary shadow-primary" />
          <div className="h-10 w-10 rounded-full bg-secondary shadow-secondary" />
          <div className="h-10 w-10 rounded-full bg-tertiary shadow-tertiary" />
        </div>
      </div>
    </div>
  );
}

export default App;
