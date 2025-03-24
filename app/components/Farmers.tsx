import React from 'react';
import { withBasePath } from "../utils/deepgramUtils";
import Image from "next/image";
import axios from 'axios';



function Farmers({ farmerlist, fetchData }) {

    const handleStatusUpdate = async (national_id, status) => {
        
        try {
          const response = await axios.post('https://doc-ai.verbatdemos.com/api/update.php', {
            national_id,
            eudr_status: status.toLowerCase() // convert to lowercase if needed
          });
          console.log(response);
          fetchData();
          toast.success("updated successfully!");
        } catch (error) {
            toast.error("Something went wrong!");
        }
      };
  return (
    <div className="text-white text-sm max-h-[calc(88vh-64px)] overflow-y-auto p-4">
      <div className="p-6">
        <div className="space-y-4 p-3">
          {farmerlist.map((farmer) => (
            <div
              key={farmer.national_id}
              className="bg-white flex items-center space-x-4 border border-gray-200 rounded-lg p-1 shadow-sm"
            >
              {/* Image */}
              <div className="bg-[#232222] text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-2xl font-bold">
                <Image
                  src={withBasePath("/farmer.png")}
                  width={60}
                  height={60}
                  alt="farmer"
                  className="p-2"
                />
              </div>

              {/* Info */}
              <div className="flex-1 px-4">
                <h3 className="text-base font-semibold text-gray-900 text-[13px]">
                  {farmer.name} | {farmer.national_id}
                </h3>
                <p className="text-sm text-gray-600">
                  {farmer.state} | {farmer.crop} | {farmer.yield_qty}
                </p>
                <div className="mt-1 space-x-1">
                    {farmer.eudr_status.toLowerCase() == 'pass' && (
                        <span className="bg-green-600 whitespace-nowrap text-white px-[10px] py-[4px] rounded-[10px] text-xs">
                        pass
                        </span>
                    )}

                    {farmer.eudr_status.toLowerCase() == 'fail' && (
                        <span className="bg-red-600 whitespace-nowrap text-white px-[10px] py-[4px] rounded-[10px] text-xs">
                        fail
                        </span>
                    )}

                    {farmer.eudr_status.toLowerCase() == 'under review' && (
                        <span className="bg-orange-600 whitespace-nowrap text-white px-[10px] py-[4px] rounded-[10px] text-xs">
                        under review
                        </span>
                    )}
                </div>
              </div>

              {/* Actions */}
              <div className="ml-auto space-y-2">
              {(farmer.eudr_status.toLowerCase()=='fail' || farmer.eudr_status.toLowerCase()=='under review') && (
                <div>                
                    <button onClick={() => handleStatusUpdate(farmer.national_id, 'pass')}
                     className="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md">
                    Approve
                    </button>
                </div>
                 )}
                 {(farmer.eudr_status.toLowerCase()=='pass' || farmer.eudr_status.toLowerCase()=='under review') && (
                    <div>                    
                        <button 
                        onClick={() => handleStatusUpdate(farmer.national_id, 'fail')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md">
                        Reject
                        </button>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Farmers;
