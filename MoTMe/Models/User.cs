﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace MoTMe.Models
{
    //daniel.cossins@yahoo.com | 1234asdfG$ | mine
    //123@gmail.com | asdfG1234% | 1234567890
    //text@example.com | asdfG1234% | 1234567890
    //124@gmail.com | asdfG1234% | mine
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(20)]
        public string Name { get; set; }
        [Required]
        [MinLength(10)]
        [MaxLength(15)]
        public string Phone { get; set; }

        [MaxLength(300)]
        public string Description { get; set; }
        public string Photo { get; set; }
        public string Location { get; set; }

        public List<int> MessageIds { get; set; }
        public List<int> ContactIds { get; set; }

        public List<Message> Messages { get; set; }
        public List<User> Contacts { get; set; }

        [Required]
        public string UserIdLink { get; set; }
    }
}