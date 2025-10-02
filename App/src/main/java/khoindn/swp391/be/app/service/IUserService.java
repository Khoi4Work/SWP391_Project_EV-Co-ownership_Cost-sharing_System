package khoindn.swp391.be.app.service;

import khoindn.swp391.be.app.model.Request.RegisterVehicleReq;
import khoindn.swp391.be.app.model.Response.RegisterVehicleRes;
import khoindn.swp391.be.app.model.Response.UsersResponse;
import khoindn.swp391.be.app.pojo.Users;

import java.util.Optional;

public interface IUserService{
    public Optional<Users> findUserById(int id);

    public Users addUser(Users users);

    public void deleteUser(int id);

    public Users updateUser(Users users, int id);

    public Users getUserByEmail(String email);

}
