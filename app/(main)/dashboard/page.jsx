import React from 'react'
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className='px-5 space-y-6'>
      {/* Budget Progress */}
      {/* Overview */}
      
      {/* Accounts grid */}
      <div className='bg-white p-4 rounded-lg shadow-md min-h-[200px]'> {/* Added min-height */}
        
        {/* Add margin-top to create space above the card */}
        <div className="mt-8"> {/* Adjust this value as needed */}
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full py-8"> {/* Adjusted padding */}
                <Plus className="h-10 w-10 mb-2" />
                <p className='text-sm font-medium'>Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;