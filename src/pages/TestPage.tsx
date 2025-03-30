
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestPage = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>React is Working!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>If you can see this card, the React application is rendering correctly.</p>
          <p>Current time: {new Date().toLocaleTimeString()}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
