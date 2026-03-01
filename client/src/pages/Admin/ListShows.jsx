import { Currency } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/Admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListShows = () => {
     const {axios,getToken,user}=useAppContext();
    const Currency=import.meta.env.VITE_CURRENCY
    const[shows,setShows]=useState([]);
    const[loading,setLoading]=useState(true);

    useEffect(()=>{
    const getAllShows=async()=>{
         try{
            const {data}= await axios.get('/api/admin/all-shows', {
                headers : {Authorization : `Bearer ${await getToken()}`}
            });
            if(data.success){
                setShows(data.shows)
                 setLoading(false);
            }else{
                toast.error("Error fetching shows");
            }
            
           
         }catch(error){
            console.log(error)
          
         } 
    }
    if(user){
         getAllShows();
    }  
    },[user]);

  return !loading? (
    <>
    <Title text1="List" text2="Shows"/>
    <div className='max-w-4xl mt-6 overflow-x-auto'>
        <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
            <thead>
                <tr className='bg-primary/20 text-left text-white'>
                <th className='p-2 font-medium pl-5'>Movie Name</th>
                <th className='p-2 font-medium pl-5'>Show Time</th>
                <th className='p-2 font-medium pl-5'>Total Bookings</th>
                <th className='p-2 font-medium pl-5'>Earnings</th>
                
                </tr>
            </thead>
            <tbody className='text-sm font-light'>
                {shows.map((show,index)=>(
                    <tr key={index} className='border-b border-primary/10
                     bg-primary/5 evenc:bg-primary/10'>
                        <td className='p-2 min-w-45 pl-5'>{show.movie.title}</td>
                        <td className='p-2 min-w-45 pl-5'>{dateFormat(show.showDateTime)}</td>
                        <td className='p-2 min-w-45 pl-5'>{Object.keys(show.occupiedSeats).length}</td>
                        <td className='p-2 min-w-45 pl-5'>{Currency}{Object.keys(show.occupiedSeats).length*show.showPrice}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    </>
  ):<Loading/>
}

export default ListShows