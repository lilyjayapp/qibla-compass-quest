import Compass from "@/components/Compass";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-qibla-primary mb-8 mt-8">
          Qibla Finder
        </h1>
        <Compass />
        <p className="mt-8 text-lg text-gray-600">
          Point your device's top edge toward the arrow to find the Qibla direction
        </p>
      </div>
    </div>
  );
};

export default Index;