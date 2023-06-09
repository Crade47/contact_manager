import { useAuth } from "../hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faPhone,
  faPenToSquare,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import api from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseContact, Contact } from "../../types/types";
import { Tooltip } from "react-tooltip";
import { ContactWindow } from "../components/ContactWindow";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  useState,
} from "react";
import { LoadingComponent } from "../components/LoadingComponent";
import { AddContactWindow } from "../components/AddContactWindow";

export const ContactsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditDisabled, setIsEditDisabled] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { cookies, Logout } = useAuth();
  const [isAddWindowOpen, setIsAddWindowOpen] = useState(false);

  //PUT request to modify the contact
  const updateContact = async (contactData: Contact) => {
    const url = `/api/contacts/${contactData._id}`;
    const body = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
    };
    return api.put(url, body, {
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    });
  };

  //POST request at the backend to create contact
  const addContactFn = async(contactData: BaseContact) =>{
    const url = `/api/contacts/`;
    const body = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
    };
    return api.post(url,body,{
      headers: {
        Authorization: `Bearer ${cookies.token}`
      }
    })
  }

  //DEL request to delete contact

  const deleteContactFn = async (contactData: Contact) =>{
    const url = `/api/contacts/${contactData._id}`
    return api.delete(url, {
      headers:{
        Authorization: `Bearer ${cookies.token}`
      }
    })
  }

  //Mutation hook for adding contact
  const { mutateAsync: addContact } = useMutation({
    mutationFn: addContactFn
  })

  // Editing mutation hook
  const {
    mutateAsync:editContact,
    isLoading: isEditLoading,
    isError: isEditError,
  } = useMutation({
    mutationFn: updateContact,
  });

  const windowOpen = (contact: Contact) => {
    setSelectedContact(contact);
    setIsOpen((prevState) => !prevState);
  };

  // Delete mutation hook

  const { mutateAsync: deleteContact } = useMutation({
    mutationFn: deleteContactFn
  })

//Handler functions for morm

  const handleContactChange = (
    event: ChangeEvent<HTMLInputElement>,
    setContactData: Dispatch<SetStateAction<Contact>>
  ) => {
    const { name, value }: HTMLInputElement = event.target;
    setContactData((prevContactData: Contact) => {
      return {
        ...prevContactData,
        [name]: value,
      };
    });
  };

  const handleUpdateContact = (
    event: MouseEvent<HTMLButtonElement, MouseEvent>,
    contactData: Contact
  ) => {
    event.preventDefault();
    editContact(contactData).then(() => {
      refetch();
    });
  };

  const handleAddContact = (event: FormEvent<HTMLFormElement>,contactData: BaseContact)=>{
    setIsAddWindowOpen(s => !s)
    event.preventDefault();
    addContact(contactData).then(()=>{
      refetch();
    })

  }

  const fetchAllContacts = async () => {
    const response = await api
      .get("/api/contacts/", {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
      .catch(function (error) {
        console.log(error.toJSON());
      });
    return response;
  };

  const handleDeleteContact = (event:MouseEvent<HTMLButtonElement, MouseEvent>, contactData:Contact) =>{
    event.stopPropagation();
    setIsOpen(prevState => !prevState);
    deleteContact(contactData).then(()=>refetch())

  }

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchAllContacts,
  });

  const Header = () => {
    return (
      <div className="flex justify-between px-3 py-6">
        <div className="text-4xl font-light text-white">Contacts</div>
        <button className="text-2xl text-white" onClick={Logout}>
          <span></span>
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            className="text-white hover:opacity-10"
          />
        </button>
      </div>
    );
  };

  const ContactList = ({ data }: { data: Contact[] }) => {
    if (isLoading) {
      return <div className="loader"></div>;
    }

    if (isError) {
      return (
        <div>
          <div className="text-center font-inter text-white">
            An error has occured. Try logging in again
          </div>
          <div className="mt-3 text-center font-inter text-white">
            {(error as any)?.message}
          </div>
        </div>
      );
    }
    return (
      <>
        {data?.map((contact: Contact) => {
          return (
            <div key={contact._id}>
              <div
                className="flex cursor-pointer items-center justify-between border-b border-gray-600 p-6"
                onClick={() => windowOpen(contact)}
              >
                <div className="flex">
                  {/* Profile */}
                  <div className="relative rounded-full bg-slate-500 p-8">
                    {/* Initial for contact in profile pic */}
                    <span className="child font-inter">
                      {contact.name[0].toUpperCase()}
                    </span>
                  </div>
                  {/* Contact Name */}
                  {isEditLoading || isRefetching ? (
                    <div className="-mt-[0.45rem] ml-5">
                      <LoadingComponent />
                    </div>
                  ) : (
                    <div className="p-4 text-xl text-white">{contact.name}</div>
                  )}
                </div>
                <div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      alert(
                        "This is just example application. Maybe in the future I will add this feature haha"
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="cursor-pointer p-5 text-xl text-gray-400"
                      data-tooltip-id="call-tooltip"
                      data-tooltip-content="Call"
                    />
                    <Tooltip id="call-tooltip" />
                  </button>

                  <button>
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="p-5 pr-0 text-xl text-gray-400"
                      data-tooltip-id="edit-tooltip"
                      data-tooltip-content="Edit"
                    />
                    <Tooltip id="edit-tooltip" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="mx-auto h-screen max-w-4xl border border-gray-700">
        <Header />
        <div className="px-11 py-6 text-2xl text-slate-300 active:text-slate-600">
          <button onClick={() => setIsAddWindowOpen(prevState => !prevState)}>
            <FontAwesomeIcon icon={faUserPlus} />
          </button>
        </div>
        <ContactList data={data?.data} />

        {/* Contact Window */}
        {isOpen && selectedContact && (
          <ContactWindow
            isOpen={isOpen}
            data={selectedContact}
            setIsOpen={setIsOpen}
            isEditDisabled={isEditDisabled}
            setIsEditDisabled={setIsEditDisabled}
            handleContactChange={handleContactChange}
            handleUpdateContact={handleUpdateContact}
            handleDeleteContact={handleDeleteContact}
          />
        )}

        {/* Add Contact Window */}

        {isAddWindowOpen && (
          <AddContactWindow 
          isAddWindowOpen={isAddWindowOpen} 
          setIsAddWindowOpen={setIsAddWindowOpen}
          handleAddContact={handleAddContact}
        />
        )}
      </div>
    </>
  );
};
