import BasicCompass from "@/components/BasicCompass";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 p-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 mt-8">
          Compass
        </h1>
        <BasicCompass />
        <p className="mt-8 text-lg text-gray-600">
          Point your device's top edge toward North
        </p>
      </div>
    </div>
  );
};

export default Index;